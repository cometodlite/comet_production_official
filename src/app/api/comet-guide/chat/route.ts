import { NextResponse } from "next/server";
import { reserveCometGuideRequest, askCometGuide, type CometGuideMessage } from "@/lib/comet-guide";

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 6;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await reserveCometGuideRequest(ip);
  if (!allowed) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요. (시간당 문의 한도에 도달했어요)" }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { message?: unknown; history?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "메시지를 입력해 주세요." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 입력해 주세요.` }, { status: 400 });
  }

  const rawHistory = Array.isArray(body?.history) ? body.history : [];
  const history: CometGuideMessage[] = rawHistory
    .filter((m): m is CometGuideMessage =>
      m && typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" && m.content.length <= MAX_MESSAGE_LENGTH
    )
    .slice(-MAX_HISTORY_TURNS);

  const result = await askCometGuide([...history, { role: "user", content: message }]);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });

  return NextResponse.json({ reply: result.text });
}
