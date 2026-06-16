import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050814",
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <circle cx="14" cy="26" r="7" stroke="#C8922A" strokeWidth="2.5" fill="none" />
        <line x1="19" y1="21" x2="36" y2="6"  stroke="#C8922A" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="21" y1="19" x2="37" y2="9"  stroke="#C8922A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <line x1="22" y1="17" x2="37" y2="12" stroke="#C8922A" strokeWidth="0.9" strokeLinecap="round" opacity="0.4" />
      </svg>
    </div>,
    { ...size }
  );
}
