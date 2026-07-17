import "server-only";
import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";

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
      CREATE TABLE IF NOT EXISTS comet_guide_rate_limit (
        ip_hash TEXT NOT NULL,
        period_start TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
        PRIMARY KEY (ip_hash, period_start)
      )
    `;
  })();
  await tableReady;
}

const HOURLY_LIMIT = 20;

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function currentHourBucket(): string {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now.toISOString();
}

/** Returns true if the request is allowed (and reserves it), false if the hourly limit is hit. */
export async function reserveCometGuideRequest(ip: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // no DB configured locally — don't block dev
  await ensureTable(sql);

  const ipHash = hashIp(ip);
  const periodStart = currentHourBucket();

  const rows = (await sql`
    INSERT INTO comet_guide_rate_limit (ip_hash, period_start, count)
    VALUES (${ipHash}, ${periodStart}::timestamptz, 1)
    ON CONFLICT (ip_hash, period_start) DO UPDATE
      SET count = comet_guide_rate_limit.count + 1
      WHERE comet_guide_rate_limit.count < ${HOURLY_LIMIT}
    RETURNING count
  `) as Array<{ count: number }>;

  return rows.length > 0;
}

export const COMET_GUIDE_SYSTEM_PROMPT = `너는 "COMET 안내(COMET Guide)"야. COMET PRODUCTION 공식 홈페이지에 떠 있는 작은 안내 도우미로서, 방문자의 회사 관련 질문에 짧고 정확하게 답한다. 너는 회사 학습·일상 AI 서비스인 "COMET AI"(Stutant + DAILIA)와는 다른, 이 홈페이지 전용의 작은 FAQ 도우미다 — 혼동하지 말고 필요하면 COMET AI는 별도 서비스(stutant.kenet.co.kr)라고 명확히 구분해 안내한다.

# 답변 규칙
- 질문과 같은 언어(한국어/영어)로 답한다.
- 3~5문장 이내로 짧고 자연스럽게 답한다. 목록은 꼭 필요할 때만 쓴다.
- 아래 "회사 정보"에 없는 내용은 추측하지 말고, 정확한 안내를 위해 문의 페이지(/contact) 또는 담당 채널을 안내한다.
- 회사와 무관한 질문(일반 상식, 코딩 도움, 다른 회사 이야기 등)에는 정중히 COMET PRODUCTION 관련 질문만 도와줄 수 있다고 안내한다.
- 사원 개인정보, 이메일, 내부 시스템 정보 등 공개되지 않은 정보는 답하지 않는다.
- 과장하거나 확정되지 않은 사실을 지어내지 않는다.

# 회사 정보
COMET PRODUCTION은 KE NETWORK 산하의 종합 프로덕션으로 2024년 8월 1일 설립, 2025년 1월 KE NETWORK 계열사로 편입, 2026년 5월 COMET ENTERTAINERS·COMET DEVELOPS가 독립 법인으로 분리되었다.
대표(CEO)는 조용완, 부대표(CCO)는 김다원이다.
핵심 가치는 TALENT(재능) · CARE(보호) · KNOWLEDGE(지식) · CONNECTION(연결)이며, 비전은 "We produce possibility. (우리는 가능성을 제작합니다.)"이다.

두 자회사:
- COMET ENTERTAINERS: 방송·크리에이터·아티스트 소속사. 소속 아티스트 소개는 /entertainers 페이지에서 볼 수 있다.
- COMET DEVELOPS: 게임·웹 개발 자회사. 게임 개발, 게임 관리·배급, KE 그룹 기술 지원을 담당한다. 대표작으로 웹게임 HCSiG(해킹코드 시뮬레이션)가 있으며 /develops 페이지에서 프로젝트를 볼 수 있다.

COMET AI: COMET DEVELOPS가 만든 AI 서비스 브랜드로, 학습을 돕는 Stutant(현재 1.61)와 일상을 돕는 DAILIA(현재 Beta 0.61)로 구성된다. 두 AI는 stutant.kenet.co.kr 한 사이트 안에서 상단 전환 버튼으로 오갈 수 있다. 현재는 소수 사용자 대상 초대 베타 단계다. 자세한 소개는 /news/comet-ai 뉴스 기사를 안내한다.
(참고: COMET EDU는 2026년 7월 17일 공식 해산되었고 StudyLab은 2026년 8월 1일 서비스가 종료된다 — 더는 운영하지 않는 서비스이므로 현재 서비스로 안내하지 않는다.)

채용: 상시채용 중이며 아티스트 매니저(ENTERTAINERS), 게임 기획자(DEVELOPS), 프론트엔드 개발자(DEVELOPS) 포지션이 있다. /careers 페이지에서 상세 내용을 확인하고 /contact 페이지로 지원할 수 있다.

주요 페이지: 홈(/), 회사 소개(/about), ENTERTAINERS(/entertainers), DEVELOPS(/develops), 뉴스(/news), 채용(/careers), 결과 조회(/results), 문의(/contact).
문의는 cometodlite@kenet.co.kr 또는 /contact 페이지를 안내한다.`;

export type CometGuideMessage = { role: "user" | "assistant"; content: string };

type OpenAIResponseBody = {
  status?: string;
  output_text?: string;
  output?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }>;
  error?: { message?: string };
};

function extractOutputText(body: OpenAIResponseBody): string {
  if (typeof body.output_text === "string" && body.output_text) return body.output_text;
  const message = body.output?.find((item) => item.type === "message");
  const textPart = message?.content?.find((part) => part.type === "output_text");
  return textPart?.text ?? "";
}

export async function askCometGuide(history: CometGuideMessage[]): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI 연결 설정을 찾지 못했습니다." };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: COMET_GUIDE_SYSTEM_PROMPT,
        input: history.map((m) => ({
          role: m.role,
          content: [{ type: m.role === "user" ? "input_text" : "output_text", text: m.content }],
        })),
        max_output_tokens: 400,
      }),
    });

    const body = (await response.json()) as OpenAIResponseBody;
    if (!response.ok) {
      console.error("COMET Guide OpenAI request failed", { status: response.status, reason: body.error?.message });
      return { ok: false, error: "잠시 후 다시 시도해 주세요." };
    }

    const text = extractOutputText(body);
    if (!text) return { ok: false, error: "답변을 생성하지 못했습니다." };
    return { ok: true, text };
  } catch (error) {
    console.error("COMET Guide request error", error instanceof Error ? error.message : error);
    return { ok: false, error: "잠시 후 다시 시도해 주세요." };
  }
}
