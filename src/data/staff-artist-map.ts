/**
 * 사원 이메일 → ENTERTAINERS 아티스트 slug 매핑.
 * 로그인 이름(실명)과 아티스트 활동명이 다를 수 있어(예: 김도영 = 고구마오지터)
 * 이름 문자열 매칭 대신 이메일로 고정 연결한다.
 */
export const STAFF_ARTIST_MAP: Record<string, string> = {
  "lunalite100@gmail.com": "ghw",
  "zkzknoob@gmail.com": "ojiter",
  "trickcallim@gmail.com": "redo",
};

export function getArtistSlugByEmail(email: string): string | null {
  return STAFF_ARTIST_MAP[email.toLowerCase()] ?? null;
}
