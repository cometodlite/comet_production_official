import { Suspense } from "react";
import PeriodTestClient from "./PeriodTestClient";

/**
 * 개발용 — 평가 기간 시뮬레이터
 * useSearchParams()를 쓰는 클라이언트 컴포넌트는 Suspense로 감싸야
 * 프로덕션 빌드의 프리렌더링이 통과합니다.
 */
export default function PeriodTestPage() {
  return (
    <Suspense fallback={null}>
      <PeriodTestClient />
    </Suspense>
  );
}
