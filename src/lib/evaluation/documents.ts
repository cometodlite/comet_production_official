import type { EvaluationTrack } from "@/lib/auth/evaluation-tracks";

export type EvaluationDocument = {
  id: string;
  title: string;
  track: EvaluationTrack;
  pdfFile: string;
  solutionFile: string;
};

export const EVALUATION_DOCUMENTS = [
  {
    id: "document-1",
    title: "일반형 역량평가 연습 1차",
    track: "entertainers-illustrator-writer",
    pdfFile: "illustrator-general-practice-1.pdf",
    solutionFile: "illustrator-general-practice-1-solution.pdf",
  },
  {
    id: "document-2",
    title: "일반형 역량평가 연습 2차",
    track: "entertainers-illustrator-writer",
    pdfFile: "illustrator-general-practice-2.pdf",
    solutionFile: "illustrator-general-practice-2-solution.pdf",
  },
  {
    id: "document-3",
    title: "일반형 역량평가 연습 3차",
    track: "entertainers-illustrator-writer",
    pdfFile: "illustrator-general-practice-3.pdf",
    solutionFile: "illustrator-general-practice-3-solution.pdf",
  },
] satisfies EvaluationDocument[];

export function getEvaluationDocument(documentId: string, evaluationTrack?: EvaluationTrack) {
  return EVALUATION_DOCUMENTS.find((document) => document.id === documentId && document.track === evaluationTrack) || null;
}

export function getEvaluationDocumentByFile(fileName: string, evaluationTrack?: EvaluationTrack) {
  return (
    EVALUATION_DOCUMENTS.find(
      (document) =>
        document.track === evaluationTrack &&
        (document.pdfFile === fileName || document.solutionFile === fileName),
    ) || null
  );
}

export function getEvaluationFileUrl(fileName: string) {
  return `/evaluation/files/${encodeURIComponent(fileName)}`;
}
