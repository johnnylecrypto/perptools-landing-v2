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
  "linear-gradient(to bottom, black 0%, black 46%, color-mix(in srgb, black 35%, transparent) 76%, transparent 96%)";

/**
 * The hero grid from the design file: 29.95x32.13px cells, 1.31px stroke,
 * fading from white at the centre to 20% at the edges.
 *
 * Drawn as an SVG <pattern> rather than the exported path so it tiles to any
 * width instead of being locked to the 1320px frame. The wrapper carries the
 * positioning: an <svg> is a replaced element and would otherwise fall back to
 * its 300x150 intrinsic size instead of filling a left/right-anchored box.
 */
const CELL_W = 29.9487;
const CELL_H = 32.1316;

export function GridLines({
  className,
  /** Cell scale. 1 is the desktop cell; the mobile hero uses a tenth of it. */
  scale = 1,
  /** Stroke width in px. Not scaled with the cell — a 0.13px hairline vanishes. */
  stroke = 1.30855,
  /** Suffix for the SVG def ids, so two grids on one page do not collide. */
  idSuffix = "",
}: {
  className?: string;
  scale?: number;
  stroke?: number;
  idSuffix?: string;
}) {
  const width = CELL_W * scale;
  const height = CELL_H * scale;
  const patternId = `pt-grid${idSuffix}`;
  const fadeId = `pt-grid-fade${idSuffix}`;
  const maskId = `pt-grid-mask${idSuffix}`;

  return (
    <div aria-hidden className={className} style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
      <svg className="size-full" preserveAspectRatio="none">
        <defs>
          <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse">
            <path
              d={`M${width} 0V${height}M0 ${stroke / 2}H${width}`}
              stroke="white"
              strokeWidth={stroke}
              fill="none"
            />
          </pattern>
          <radialGradient id={fadeId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="white" stopOpacity="0.2" />
          </radialGradient>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill={`url(#${fadeId})`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
      </svg>
    </div>
  );
}
