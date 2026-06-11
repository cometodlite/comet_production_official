/**
 * 이메일 발송 유틸리티 (Resend REST API 사용)
 *
 * 환경변수:
 *  - RESEND_API_KEY  : Resend API 키 (없으면 이메일 발송 건너뜀)
 *  - EMAIL_FROM      : 발신 주소 (기본값: "COMET <noreply@comet.ac>")
 *  - BOARD_NOTIFICATION_EMAIL : 이사회 알림 수신 주소
 */

const FROM = process.env.EMAIL_FROM ?? "COMET <noreply@comet.ac>";

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // 개발 환경에서는 콘솔 출력으로 대체
    if (process.env.NODE_ENV !== "production") {
      console.log("[EMAIL] (no RESEND_API_KEY) →", input.to, "|", input.subject);
    }
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[EMAIL] Resend error ${res.status}:`, text);
    }
  } catch (e) {
    console.error("[EMAIL] fetch error:", e);
  }
}

/** 이사회 알림 수신 주소 목록 (쉼표 구분) */
export function getBoardEmails(): string[] {
  const raw = process.env.BOARD_NOTIFICATION_EMAIL ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── 이메일 템플릿 ───────────────────────────────────────────────────────────────

function baseHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0a0a0a; color:#e5e5e5; padding:32px 16px;">
  <div style="max-width:560px; margin:0 auto; background:#111; border:1px solid #222; border-radius:12px; overflow:hidden;">
    <div style="background:#1a1a2e; padding:20px 28px; border-bottom:1px solid #222;">
      <p style="margin:0; font-size:11px; font-weight:700; letter-spacing:0.25em; color:#818cf8;">COMET</p>
    </div>
    <div style="padding:28px;">
      ${body}
    </div>
    <div style="padding:16px 28px; border-top:1px solid #1e1e1e; font-size:11px; color:#555;">
      COMET 자동 발송 메일 · 회신하지 마세요.
    </div>
  </div>
</body>
</html>`;
}

/** 새 실전 답안 제출 → 이사회 알림 */
export function makeNewSubmissionEmail(input: {
  memberName: string;
  applicantName: string;
  evaluationTrack: string;
  submittedAt: string;
}) {
  const subject = `[COMET] 새 실전 답안 제출 — ${input.applicantName || input.memberName}`;
  const html = baseHtml(subject, `
    <h2 style="margin:0 0 16px; font-size:20px; font-weight:800; color:#fff;">새 실전 답안이 제출됐습니다</h2>
    <table style="width:100%; border-collapse:collapse; font-size:14px;">
      <tr><td style="padding:8px 0; color:#888; width:90px;">회원명</td><td style="padding:8px 0; color:#e5e5e5; font-weight:600;">${input.memberName}</td></tr>
      <tr><td style="padding:8px 0; color:#888;">응시자명</td><td style="padding:8px 0; color:#e5e5e5;">${input.applicantName || "—"}</td></tr>
      <tr><td style="padding:8px 0; color:#888;">트랙</td><td style="padding:8px 0; color:#e5e5e5;">${input.evaluationTrack}</td></tr>
      <tr><td style="padding:8px 0; color:#888;">제출 시각</td><td style="padding:8px 0; color:#e5e5e5;">${new Date(input.submittedAt).toLocaleString("ko-KR")}</td></tr>
    </table>
    <p style="margin-top:24px; font-size:13px; color:#888;">이사회 패널에서 답안을 확인하고 채점해 주세요.</p>
  `);
  return { subject, html };
}

/** 합불 결정 → 지원자 알림 */
export function makeVerdictEmail(input: {
  applicantName: string;
  verdict: "pass" | "fail";
  verdictNote?: string | null;
}) {
  const isPass = input.verdict === "pass";
  const subject = `[COMET] 실전 역량평가 결과 안내 — ${isPass ? "합격" : "불합격"}`;
  const html = baseHtml(subject, `
    <h2 style="margin:0 0 8px; font-size:20px; font-weight:800; color:${isPass ? "#34d399" : "#f87171"};">
      ${isPass ? "✓ 합격을 축하드립니다!" : "✗ 이번 평가는 아쉽게도 불합격입니다."}
    </h2>
    <p style="margin:0 0 20px; font-size:14px; color:#888;">${input.applicantName}님의 COMET 실전 역량평가 결과가 확정됐습니다.</p>
    ${input.verdictNote ? `
    <div style="background:#1a1a1a; border:1px solid #2a2a2a; border-radius:8px; padding:16px; margin-bottom:20px;">
      <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.2em; color:#555;">이사회 코멘트</p>
      <p style="margin:0; font-size:14px; color:#ccc; line-height:1.6;">${input.verdictNote}</p>
    </div>` : ""}
    <p style="font-size:13px; color:#666; line-height:1.6;">
      ${isPass
        ? "추가 안내는 별도로 전달될 예정입니다. 수고하셨습니다."
        : "다음 기회에 다시 도전하실 수 있습니다. 수고하셨습니다."}
    </p>
  `);
  return { subject, html };
}
