/** ACistant 모델 목록 — 서버(route/lib)와 클라이언트(UI) 공용. server-only 아님. */

export const ACISTANT_MODELS = ["gpt-4.1", "gpt-4.1-mini"] as const;
export type AcistantModel = (typeof ACISTANT_MODELS)[number];

export const ACISTANT_DEFAULT_MODEL: AcistantModel = "gpt-4.1";

export const ACISTANT_MODEL_LABELS: Record<AcistantModel, string> = {
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 mini",
};

export function isAcistantModel(value: unknown): value is AcistantModel {
  return typeof value === "string" && (ACISTANT_MODELS as readonly string[]).includes(value);
}
