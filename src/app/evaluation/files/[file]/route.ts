import { promises as fs } from "node:fs";
import path from "node:path";
import { requireEvaluationUser } from "@/lib/auth/current-user";
import { getEvaluationDocumentByFile } from "@/lib/evaluation/documents";

const EVALUATION_FILE_DIR = path.join(process.cwd(), "private", "evaluation");

export async function GET(_request: Request, context: RouteContext<"/evaluation/files/[file]">) {
  const user = await requireEvaluationUser();
  const { file } = await context.params;
  const fileName = decodeURIComponent(file);

  if (fileName.includes("/") || fileName.includes("\\") || !fileName.endsWith(".pdf")) {
    return new Response("Not found", { status: 404 });
  }

  const document = getEvaluationDocumentByFile(fileName, user.evaluationTrack);
  if (!document) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const bytes = await fs.readFile(path.join(EVALUATION_FILE_DIR, fileName));
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
