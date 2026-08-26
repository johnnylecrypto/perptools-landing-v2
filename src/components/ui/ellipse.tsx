import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Numbers are treated as px; strings pass through so `%`, `vw`, `calc()` work. */
type Length = number | string;

export type EllipseBlend = "screen" | "soft-light" | "overlay" | "lighten" | "normal";

export type EllipseProps = {
  /** Fill colour, e.g. `#094E6A`. */
  color: string;
  width: Length;
  height: Length;
  /**
   * Gaussian blur radius. Defaults to the design file's 192.26px — note Figma
   * reports this as "Layer blur 384.53", which is the diameter.
   */
  blur?: Length;
  /** Corner radius. Defaults to fully round; the design file uses 102.34 here. */
  radius?: Length;
  /** How the glow composites onto the layers beneath it. */
  blend?: EllipseBlend;
  opacity?: number;
  left?: Length;
  top?: Length;
  right?: Length;
  bottom?: Length;
  className?: string;
  style?: CSSProperties;
};

const blendClass: Record<EllipseBlend, string> = {
  screen: "mix-blend-screen",
  "soft-light": "mix-blend-soft-light",
  overlay: "mix-blend-overlay",
  lighten: "mix-blend-lighten",
  normal: "mix-blend-normal",
};

function toLength(value: Length | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Blurred glow ellipse used behind hero and CTA sections.
 *
 * Positioned absolutely, so it needs a `relative`/`absolute` ancestor. Purely
 * decorative: it is hidden from assistive tech and ignores pointer events.
 *
 * The design file also carries a `box-shadow` on these shapes, but its export
 * has no colour, so the visible glow comes entirely from `filter: blur()`.
 */
export function Ellipse({
  color,
  width,
  height,
  blur = 192.26,
  radius = 9999,
  blend = "screen",
  opacity,
  left,
  top,
  right,
  bottom,
  className,
  style,
}: EllipseProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute", blendClass[blend], className)}
      style={{
        width: toLength(width),
        height: toLength(height),
        borderRadius: toLength(radius),
        left: toLength(left),
        top: toLength(top),
        right: toLength(right),
        bottom: toLength(bottom),
        background: color,
        filter: `blur(${toLength(blur)})`,
        opacity,
        ...style,
      }}
    />
  );
}
