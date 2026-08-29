/**
 * 경로 목록 — 사이트 공통 크롬(Navbar, Footer, StarField, COMET 안내 위젯,
 * 상단 여백)을 렌더링하지 않는 완전 독립 페이지.
 * 예: /game/chemlab (외부 게임 iframe, stutant.kenet.co.kr/minit처럼 독립된 부분)
 */
export const CHROMELESS_ROUTE_PREFIXES = ["/game/chemlab"];

export function isChromelessRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CHROMELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
