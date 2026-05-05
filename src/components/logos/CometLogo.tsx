interface CometLogoProps {
  size?: number;
  className?: string;
}

export function CometProductionLogo({ size = 40, className = "" }: CometLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="14" cy="26" r="7" stroke="#C8922A" strokeWidth="2" fill="none"/>
      <line x1="19" y1="21" x2="36" y2="6" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="21" y1="19" x2="37" y2="9" stroke="#C8922A" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <line x1="22" y1="17" x2="37" y2="12" stroke="#C8922A" strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function CometEntertainersWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 80" fill="none" className={className}>
      <text
        x="160" y="46"
        textAnchor="middle"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="42"
        letterSpacing="4"
        fill="currentColor"
      >
        COMET
      </text>
      <text
        x="160" y="68"
        textAnchor="middle"
        fontFamily="'Arial', 'Helvetica Neue', sans-serif"
        fontWeight="500"
        fontSize="14"
        letterSpacing="8"
        fill="currentColor"
        opacity="0.85"
      >
        ENTERTAINERS
      </text>
    </svg>
  );
}
