import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "linear-gradient(160deg, var(--color-bg-0) 40%, var(--color-bg-3) 100%)",
        color: "var(--color-fg)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 6,
          color: "var(--color-accent-light)",
        }}
      >
        PERPTOOLS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
          The Market
        </div>
        <div
          style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, color: "var(--color-accent)" }}
        >
          Never Sleeps.
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "var(--color-fg-muted)", maxWidth: 900 }}>
        Autonomous agents. On-chain transparency. CEX-grade performance.
      </div>
    </div>,
    size,
  );
}
