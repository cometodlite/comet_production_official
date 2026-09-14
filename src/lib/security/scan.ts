import "server-only";

import { SECURITY_TARGETS } from "@/lib/security/targets";
import { checkTlsCertificate, checkSecurityHeaders, checkExposedFiles, checkDns } from "@/lib/security/checks";
import { saveSecurityScanRun, type TargetScanResult } from "@/lib/security/store";

async function scanTarget(target: (typeof SECURITY_TARGETS)[number]): Promise<TargetScanResult> {
  try {
    const [tls, headers, exposure, dns] = await Promise.all([
      checkTlsCertificate(target.hostname),
      checkSecurityHeaders(target),
      checkExposedFiles(target),
      checkDns(target),
    ]);

    return {
      targetId: target.id,
      targetLabel: target.label,
      findings: [...tls, ...headers, ...exposure, ...dns],
    };
  } catch (error) {
    return {
      targetId: target.id,
      targetLabel: target.label,
      findings: [],
      erroredAt: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runSecurityScan(trigger: "cron" | "manual") {
  const results = await Promise.all(SECURITY_TARGETS.map(scanTarget));
  return saveSecurityScanRun({ trigger, results });
}
