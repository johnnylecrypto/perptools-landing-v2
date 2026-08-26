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
        background: "linear-gradient(160deg, #030507 40%, #0b1015 100%)",
        color: "#edeff2",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#83d4fb" }}>
        PERPTOOLS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
          The Market
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, color: "#2bb9f3" }}>
          Never Sleeps.
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#b6bec9", maxWidth: 900 }}>
        Autonomous agents. On-chain transparency. CEX-grade performance.
      </div>
    </div>,
    size,
  );
}
