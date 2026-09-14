import "server-only";

import { connect as tlsConnect } from "node:tls";
import { resolve4, resolve6, resolveMx, resolveTxt, resolveCname } from "node:dns/promises";
import type { SecurityTarget } from "@/lib/security/targets";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type SecurityFinding = {
  category: "tls" | "headers" | "exposure" | "dns";
  severity: Severity;
  title: string;
  detail: string;
};

const FETCH_TIMEOUT_MS = 8000;

async function timedFetch(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "manual" });
  } finally {
    clearTimeout(timer);
  }
}

// ── TLS/SSL ───────────────────────────────────────────────────────────────

export async function checkTlsCertificate(hostname: string): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];

  try {
    const info = await new Promise<{
      validTo: string;
      validFrom: string;
      protocol: string | null;
      issuer: string;
    }>((resolve, reject) => {
      const socket = tlsConnect(
        { host: hostname, port: 443, servername: hostname, timeout: FETCH_TIMEOUT_MS },
        () => {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol();
          socket.end();
          if (!cert || !cert.valid_to) {
            reject(new Error("인증서 정보를 가져올 수 없습니다."));
            return;
          }
          resolve({
            validTo: cert.valid_to,
            validFrom: cert.valid_from,
            protocol,
            issuer: cert.issuer?.O || cert.issuer?.CN || "알 수 없음",
          });
        },
      );
      socket.on("error", reject);
      socket.on("timeout", () => {
        socket.destroy();
        reject(new Error("TLS 연결 시간 초과"));
      });
    });

    const expiresAt = new Date(info.validTo);
    const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      findings.push({
        category: "tls",
        severity: "critical",
        title: "SSL 인증서 만료됨",
        detail: `${hostname} 인증서가 ${expiresAt.toLocaleDateString("ko-KR")}에 만료되었습니다.`,
      });
    } else if (daysLeft <= 14) {
      findings.push({
        category: "tls",
        severity: "high",
        title: "SSL 인증서 만료 임박",
        detail: `${hostname} 인증서가 ${daysLeft}일 후(${expiresAt.toLocaleDateString("ko-KR")}) 만료됩니다.`,
      });
    } else if (daysLeft <= 30) {
      findings.push({
        category: "tls",
        severity: "medium",
        title: "SSL 인증서 갱신 필요",
        detail: `${hostname} 인증서가 ${daysLeft}일 후 만료됩니다.`,
      });
    } else {
      findings.push({
        category: "tls",
        severity: "info",
        title: "SSL 인증서 정상",
        detail: `${hostname} 인증서는 ${expiresAt.toLocaleDateString("ko-KR")}까지 유효합니다 (발급: ${info.issuer}).`,
      });
    }

    if (info.protocol && (info.protocol === "TLSv1" || info.protocol === "TLSv1.1")) {
      findings.push({
        category: "tls",
        severity: "high",
        title: "취약한 TLS 프로토콜",
        detail: `${hostname}이(가) 더 이상 안전하지 않은 ${info.protocol}을(를) 허용합니다.`,
      });
    }
  } catch (error) {
    findings.push({
      category: "tls",
      severity: "medium",
      title: "SSL 점검 실패",
      detail: `${hostname}에 TLS 연결을 시도했지만 실패했습니다: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return findings;
}

// ── HTTP 보안 헤더 ─────────────────────────────────────────────────────────

const REQUIRED_HEADERS: { key: string; label: string; severity: Severity }[] = [
  { key: "strict-transport-security", label: "HSTS (Strict-Transport-Security)", severity: "high" },
  { key: "x-content-type-options", label: "X-Content-Type-Options", severity: "low" },
  { key: "x-frame-options", label: "X-Frame-Options", severity: "medium" },
  { key: "content-security-policy", label: "Content-Security-Policy", severity: "medium" },
  { key: "referrer-policy", label: "Referrer-Policy", severity: "low" },
];

export async function checkSecurityHeaders(target: SecurityTarget): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];

  try {
    const response = await timedFetch(target.baseUrl, { method: "GET" });
    const headers = response.headers;

    for (const item of REQUIRED_HEADERS) {
      if (!headers.get(item.key)) {
        findings.push({
          category: "headers",
          severity: item.severity,
          title: `${item.label} 헤더 누락`,
          detail: `${target.label} 응답에 ${item.label} 헤더가 없습니다.`,
        });
      }
    }

    if (findings.length === 0) {
      findings.push({
        category: "headers",
        severity: "info",
        title: "보안 헤더 정상",
        detail: `${target.label}에서 주요 보안 헤더가 모두 확인되었습니다.`,
      });
    }
  } catch (error) {
    findings.push({
      category: "headers",
      severity: "medium",
      title: "헤더 점검 실패",
      detail: `${target.label}에 접속하지 못했습니다: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  try {
    const httpUrl = target.baseUrl.replace("https://", "http://");
    const response = await timedFetch(httpUrl, { method: "GET" });
    const isRedirectedToHttps =
      response.status >= 300 &&
      response.status < 400 &&
      (response.headers.get("location") || "").startsWith("https://");
    if (!isRedirectedToHttps) {
      findings.push({
        category: "headers",
        severity: "high",
        title: "HTTP → HTTPS 강제 리다이렉트 없음",
        detail: `${target.label}의 HTTP(80) 요청이 HTTPS로 리다이렉트되지 않습니다 (status ${response.status}).`,
      });
    }
  } catch {
    // HTTP 포트가 막혀 있는 경우는 오히려 안전하므로 무시합니다.
  }

  return findings;
}

// ── 민감 정보/설정 파일 노출 ─────────────────────────────────────────────────

const SENSITIVE_PATHS = [
  "/.env",
  "/.env.local",
  "/.env.production",
  "/.git/config",
  "/.git/HEAD",
  "/.DS_Store",
  "/config.json",
  "/.aws/credentials",
  "/wp-config.php",
  "/id_rsa",
  "/backup.zip",
  "/.vercel/project.json",
  "/package.json",
];

export async function checkExposedFiles(target: SecurityTarget): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];

  let baseline: { status: number; length: number } | null = null;
  try {
    const probePath = `/__comet-security-probe-${Date.now()}`;
    const probe = await timedFetch(`${target.baseUrl}${probePath}`, { method: "GET" });
    const body = await probe.text();
    baseline = { status: probe.status, length: body.length };
  } catch (error) {
    findings.push({
      category: "exposure",
      severity: "medium",
      title: "노출 점검 실패",
      detail: `${target.label}에 접속하지 못해 파일 노출 점검을 건너뜁니다: ${error instanceof Error ? error.message : String(error)}`,
    });
    return findings;
  }

  const results = await Promise.allSettled(
    SENSITIVE_PATHS.map(async (path) => {
      const response = await timedFetch(`${target.baseUrl}${path}`, { method: "GET" });
      const body = await response.text();
      return { path, status: response.status, length: body.length };
    }),
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const { path, status, length } = result.value;
    const looksLikeBaseline = baseline && status === baseline.status && length === baseline.length;
    if (status === 200 && !looksLikeBaseline && length > 0) {
      findings.push({
        category: "exposure",
        severity: "critical",
        title: "민감 경로 노출 의심",
        detail: `${target.label}${path} 경로가 200 응답(길이 ${length})을 반환합니다. 실수로 노출된 파일인지 확인이 필요합니다.`,
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      category: "exposure",
      severity: "info",
      title: "민감 경로 노출 없음",
      detail: `${target.label}에서 점검한 ${SENSITIVE_PATHS.length}개 경로 중 노출된 항목이 없습니다.`,
    });
  }

  return findings;
}

// ── DNS/도메인 상태 ─────────────────────────────────────────────────────────

export async function checkDns(target: SecurityTarget): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  const { hostname, label } = target;

  const [a, aaaa, mx, txt, dmarc] = await Promise.allSettled([
    resolve4(hostname),
    resolve6(hostname),
    resolveMx(hostname),
    resolveTxt(hostname),
    resolveTxt(`_dmarc.${hostname}`),
  ]);

  if (a.status === "rejected" && aaaa.status === "rejected") {
    findings.push({
      category: "dns",
      severity: "critical",
      title: "도메인 해석 실패",
      detail: `${label}에 대한 A/AAAA 레코드를 찾을 수 없습니다. 도메인이 정상적으로 연결되지 않을 수 있습니다.`,
    });
  }

  if (mx.status === "fulfilled" && mx.value.length > 0) {
    const spfRecords =
      txt.status === "fulfilled" ? txt.value.filter((r) => r.join("").startsWith("v=spf1")) : [];
    if (spfRecords.length === 0) {
      findings.push({
        category: "dns",
        severity: "medium",
        title: "SPF 레코드 없음",
        detail: `${label}이(가) 메일(MX)을 사용하지만 SPF 레코드가 없어 이메일 스푸핑에 취약할 수 있습니다.`,
      });
    }
    if (dmarc.status === "rejected" || dmarc.value.length === 0) {
      findings.push({
        category: "dns",
        severity: "medium",
        title: "DMARC 레코드 없음",
        detail: `${label}에 _dmarc TXT 레코드가 없어 이메일 위조 방지 정책이 설정되어 있지 않습니다.`,
      });
    }
  }

  try {
    const cname = await resolveCname(hostname);
    if (cname.length > 0) {
      const cnameTarget = cname[0];
      const resolved = await Promise.allSettled([resolve4(cnameTarget), resolve6(cnameTarget)]);
      const allFailed = resolved.every((r) => r.status === "rejected");
      if (allFailed) {
        findings.push({
          category: "dns",
          severity: "critical",
          title: "댕글링 CNAME 의심 (서브도메인 탈취 위험)",
          detail: `${label}이(가) 더 이상 응답하지 않는 ${cnameTarget}을(를) 가리키고 있어 서브도메인 탈취 위험이 있습니다.`,
        });
      }
    }
  } catch {
    // CNAME이 없는 것은 정상적인 상태입니다 (A 레코드 직접 사용 등).
  }

  if (findings.length === 0) {
    findings.push({
      category: "dns",
      severity: "info",
      title: "DNS 상태 정상",
      detail: `${label}의 DNS 레코드에서 특이사항이 발견되지 않았습니다.`,
    });
  }

  return findings;
}
