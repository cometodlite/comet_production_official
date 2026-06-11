/**
 * COMET 라인 아이콘 세트
 * - 24x24 그리드, currentColor 스트로크, 기본 1.5px
 * - 이모지 대체용. 색상은 부모의 text-* 로 제어합니다.
 */

export type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

function svgProps(size: number, strokeWidth: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

/** 발견 / 발굴 — 반짝이는 별 */
export function IconSparkle({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M12 3.5l1.6 5.3 5.3 1.6-5.3 1.6L12 17.3l-1.6-5.3L5.1 10.4l5.3-1.6z" />
      <path d="M18.5 16.2l.55 1.75 1.75.55-1.75.55-.55 1.75-.55-1.75-1.75-.55 1.75-.55z" />
    </svg>
  );
}

/** 관리 / 가치 — 보석 */
export function IconGem({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M11 3 8 9l4 12 4-12-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}

/** 지원 / 성장 — 로켓 */
export function IconRocket({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/** 게임 개발 — 게임패드 */
export function IconGamepad({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <path d="M17.32 6H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 10.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 6z" />
    </svg>
  );
}

/** 배급 / 패키징 — 박스 */
export function IconPackage({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

/** 기술 지원 — 렌치 */
export function IconWrench({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** 설립 배경 / 문서 — 파일 */
export function IconDocument({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

/** 설립 배경(개발) / 위성 — 궤도 */
export function IconOrbit({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416" />
      <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416" />
    </svg>
  );
}

/** 검색 — 돋보기 */
export function IconSearch({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/** 결과 없음 — 빈 문서 */
export function IconFileSearch({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg {...svgProps(size, strokeWidth, className)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" />
      <path d="M14 2v6h6" />
      <circle cx="16.5" cy="16.5" r="2.5" />
      <path d="m21 21-1.6-1.6" />
    </svg>
  );
}
