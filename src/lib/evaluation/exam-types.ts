/**
 * Unified question type used by both hardcoded and DB-backed question sets.
 * RealExamWorkspace is data-agnostic — it only needs ExamQuestionData[].
 */
export type ExamQuestionData = {
  id: string;
  type: "choice" | "written";
  text: string;
  choices?: readonly [string, string, string, string, string];
  /** Correct choice number ("1"–"5"), only for choice questions */
  correctAnswer?: string;
  explanation?: string;
  /** Model answer shown after exam, only for written questions */
  modelAnswer?: string;
  /** Textarea rows hint for written questions */
  rows?: number;
  /**
   * true → placed AFTER shuffled MC block (e.g. written Q19-20).
   * false → enters the random shuffle pool.
   */
  fixedLast: boolean;
};

export type ExamSetMeta = {
  setId: string;
  label: string;
  questionCount: number;
  mcCount: number;
  writtenCount: number;
  isActive: boolean;
};
