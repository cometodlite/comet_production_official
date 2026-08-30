import {
  ACISTANT_MAX_CONTENT_LENGTH,
  ACISTANT_MAX_HISTORY_MESSAGES,
  createAcistantStream,
  reserveAcistantRequest,
  type AcistantMessage,
} from "@/lib/acistant";
import { ACISTANT_DEFAULT_MODEL, isAcistantModel, type AcistantModel } from "@/lib/acistant-models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function parseMessages(raw: unknown): AcistantMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is AcistantMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= ACISTANT_MAX_CONTENT_LENGTH
    )
    .slice(-ACISTANT_MAX_HISTORY_MESSAGES);
}

export async function POST(request: Request) {
  const allowed = await reserveAcistantRequest(getClientIp(request));
  if (!allowed) {
    return Response.json(
      { error: "시간당 사용 한도에 도달했어요. 잠시 후 다시 시도해 주세요." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { messages?: unknown; model?: unknown }
    | null;

  const rawModel: unknown = body?.model;
  const messages = parseMessages(body?.messages);
  if (messages.length === 0) {
    return Response.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
  }
  if (messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "마지막 메시지는 사용자 메시지여야 합니다." }, { status: 400 });
  }

  const model: AcistantModel = isAcistantModel(rawModel) ? rawModel : ACISTANT_DEFAULT_MODEL;

  const result = await createAcistantStream(messages, model);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
