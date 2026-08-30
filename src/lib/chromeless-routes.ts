/**
 * 경로 목록 — 사이트 공통 크롬(Navbar, Footer, StarField, COMET 안내 위젯,
 * 상단 여백)을 렌더링하지 않는 완전 독립 페이지.
 * 예: /game/chemlab (외부 게임 iframe), /acistant (독립 코딩 어시스턴트 사이트)
 */
export const CHROMELESS_ROUTE_PREFIXES = ["/game/chemlab", "/acistant"];

export function isChromelessRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return CHROMELESS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
