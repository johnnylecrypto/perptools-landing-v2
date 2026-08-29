import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori renders this outside the DOM, so it never sees globals.css — every
// colour here has to be a literal. Keep in sync with the tokens named alongside.
const c = {
  bg0: "#030507", // --color-bg-0
  bg3: "#0b1015", // --color-bg-3
  fg: "#edeff2", // --color-fg
  fgMuted: "#b6bec9", // --color-fg-muted
  accent: "#2bb9f3", // --color-accent
  accentLight: "#83d4fb", // --color-accent-light
};

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
        background: `linear-gradient(160deg, ${c.bg0} 40%, ${c.bg3} 100%)`,
        color: c.fg,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 26,
          letterSpacing: 6,
          color: c.accentLight,
        }}
      >
        PERPTOOLS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>
          The Market
        </div>
        <div
          style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, color: c.accent }}
        >
          Never Sleeps.
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: c.fgMuted, maxWidth: 900 }}>
        Autonomous agents. On-chain transparency. CEX-grade performance.
      </div>
    </div>,
    size,
  );
}
