/**
 * Vertical fade over the whole grid.
 *
 * Separate from the SVG's radial fade, and deliberately so: that one pulls the
 * grid back evenly on all four sides, which still leaves it meeting the hero's
 * bottom edge at full strength. This one dissolves it downward so it is gone
 * before the dark gradient and the partner strip at the foot of the section.
 *
 * A CSS mask on the wrapper rather than a second SVG gradient — stacking two
 * rects inside an SVG `<mask>` paints one over the other instead of multiplying
 * them, so the radial fade would simply be replaced.
 */
const FADE =
  "linear-gradient(to bottom, #000 0%, #000 46%, rgb(0 0 0 / 0.35) 76%, transparent 96%)";

/**
 * The hero grid from the design file: 29.95x32.13px cells, 1.31px stroke,
 * fading from white at the centre to 20% at the edges.
 *
 * Drawn as an SVG <pattern> rather than the exported path so it tiles to any
 * width instead of being locked to the 1320px frame. The wrapper carries the
 * positioning: an <svg> is a replaced element and would otherwise fall back to
 * its 300x150 intrinsic size instead of filling a left/right-anchored box.
 */
export function GridLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className} style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
      <svg className="size-full" preserveAspectRatio="none">
        <defs>
          <pattern id="pt-grid" width="29.9487" height="32.1316" patternUnits="userSpaceOnUse">
            <path
              d="M29.9487 0V32.1316M0 0.6543H29.9487"
              stroke="white"
              strokeWidth="1.30855"
              fill="none"
            />
          </pattern>
          <radialGradient id="pt-grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </radialGradient>
          <mask id="pt-grid-mask">
            <rect width="100%" height="100%" fill="url(#pt-grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#pt-grid)" mask="url(#pt-grid-mask)" />
      </svg>
    </div>
  );
}
