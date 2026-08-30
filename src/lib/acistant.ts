import "server-only";
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { ACISTANT_DEFAULT_MODEL, ACISTANT_MODELS, type AcistantModel } from "@/lib/acistant-models";

export { ACISTANT_DEFAULT_MODEL, ACISTANT_MODELS, type AcistantModel };

/* ──────────────────────────────────────────────────────────────
   ACistant — COMET PRODUCTION 코딩 어시스턴트 (comet.kenet.co.kr/acistant)
   comet.kenet.co.kr 홈페이지와는 분리된 독립 사이트.
   백엔드는 홈페이지와 같은 OPENAI_API_KEY를 재사용한다.
   ────────────────────────────────────────────────────────────── */

export type AcistantRole = "user" | "assistant";
export type AcistantMessage = { role: AcistantRole; content: string };

export const ACISTANT_MAX_CONTENT_LENGTH = 16_000;
export const ACISTANT_MAX_HISTORY_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 2_048;
const HOURLY_LIMIT = 40;

export const ACISTANT_SYSTEM_PROMPT = `너는 "ACistant"야. COMET PRODUCTION이 만든 코딩 전용 AI 어시스턴트로, comet.kenet.co.kr/acistant 에서 독립적으로 운영된다. Codex, Claude Code 같은 코딩 도우미를 지향한다.

# 역할
- 코드 작성·리팩터링·디버깅·리뷰, 오류 메시지 해석, 알고리즘/자료구조 설명, 언어·프레임워크 사용법 안내를 돕는다.
- 사용자가 붙여넣은 코드/스택트레이스/요구사항을 바탕으로 구체적으로 답한다.
- 요구사항이 모호하면 섣불리 가정하지 말고 짧게 되묻는다.

# 답변 형식
- 질문과 같은 언어(한국어/영어)로 답한다.
- 군더더기 없이 핵심부터. 설명은 필요한 만큼만.
- 모든 코드는 언어 태그가 붙은 펜스 코드블록(\`\`\`ts 등)으로 제시한다. 파일 전체를 다시 쓰지 말고 바뀌는 부분 위주로 보여준다.
- 터미널 명령은 별도의 \`\`\`bash 블록에, 한 블록에 한 명령.
- 확실하지 않은 부분은 추측이라고 밝힌다. API·동작을 지어내지 않는다.
- 보안에 민감한 코드(인증, 비밀키, 결제 등)는 위험을 함께 짚어준다.

# 하지 않을 것
- 악성코드, 실제 대상에 대한 공격 코드, 탐지 회피 목적의 코드 작성.
- 코드와 무관한 일반 대화는 정중히 코딩 관련 질문을 도와줄 수 있다고 안내한다.`;

/* ── 레이트 리밋 (홈페이지의 comet-guide 패턴 재사용, 전용 테이블) ── */

type SqlClient = ReturnType<typeof neon>;
let _sql: SqlClient | null = null;

function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  _sql ||= neon(url);
  return _sql;
}

let tableReady: Promise<void> | null = null;

async function ensureTable(sql: SqlClient) {
  tableReady ||= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS acistant_rate_limit (
        ip_hash TEXT NOT NULL,
        period_start TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
        PRIMARY KEY (ip_hash, period_start)
      )
    `;
  })();
  await tableReady;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function currentHourBucket(): string {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString();
}

/** true면 요청 허용(+예약), false면 시간당 한도 초과. DB 미설정 시 항상 허용. */
export async function reserveAcistantRequest(ip: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  await ensureTable(sql);

  const rows = (await sql`
    INSERT INTO acistant_rate_limit (ip_hash, period_start, count)
    VALUES (${hashIp(ip)}, ${currentHourBucket()}::timestamptz, 1)
    ON CONFLICT (ip_hash, period_start) DO UPDATE
      SET count = acistant_rate_limit.count + 1
      WHERE acistant_rate_limit.count < ${HOURLY_LIMIT}
    RETURNING count
  `) as Array<{ count: number }>;

  return rows.length > 0;
}

/* ── OpenAI Responses API 스트리밍 ── */

type StreamResult =
  | { ok: true; stream: ReadableStream<Uint8Array> }
  | { ok: false; status: number; error: string };

export async function createAcistantStream(
  history: AcistantMessage[],
  model: AcistantModel
): Promise<StreamResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, status: 503, error: "AI 연결 설정을 찾지 못했습니다." };

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        model,
        instructions: ACISTANT_SYSTEM_PROMPT,
        input: history.map((m) => ({
          role: m.role,
          content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.content }],
        })),
        max_output_tokens: MAX_OUTPUT_TOKENS,
        stream: true,
      }),
    });
  } catch (error) {
    console.error("ACistant upstream request error", error instanceof Error ? error.message : error);
    return { ok: false, status: 502, error: "잠시 후 다시 시도해 주세요." };
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("ACistant upstream failed", { status: upstream.status, detail: detail.slice(0, 500) });
    return { ok: false, status: 502, error: "잠시 후 다시 시도해 주세요." };
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE 이벤트는 빈 줄(\n\n)로 구분된다.
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            for (const line of event.split("\n")) {
              const trimmed = line.trimStart();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data) as { type?: string; delta?: unknown };
                if (parsed.type === "response.output_text.delta" && typeof parsed.delta === "string") {
                  controller.enqueue(encoder.encode(parsed.delta));
                } else if (parsed.type === "response.failed" || parsed.type === "error") {
                  console.error("ACistant stream error event", JSON.stringify(parsed).slice(0, 500));
                }
              } catch {
                /* 부분 JSON 등은 무시 */
              }
            }
          }
        }
      } catch (error) {
        console.error("ACistant stream read error", error instanceof Error ? error.message : error);
      } finally {
        controller.close();
      }
    },
  });

  return { ok: true, stream };
}
