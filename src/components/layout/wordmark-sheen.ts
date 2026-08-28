/**
 * Shared palette and gradient for the footer wordmark's travelling highlight.
 *
 * Both footer wordmarks light their letters the same way: one wide gradient
 * image tiled behind `background-clip: text`, with a narrow bright band in its
 * middle that the animation frame slides across. Only the timing differs, so
 * the picture itself lives here rather than in each of them.
 */

export type RGBA = [number, number, number, number];

/** Letters at rest, and at the crest of the pass. Taken from the design file. */
export const DIM: RGBA = [255, 255, 255, 0.1];
export const PEAK: RGBA = [214, 240, 255, 0.62];

export const rgba = (c: RGBA) => `rgba(${c[0]},${c[1]},${c[2]},${c[3]})`;

export const mix = (a: RGBA, b: RGBA, t: number): RGBA => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
  Number((a[3] + (b[3] - a[3]) * t).toFixed(3)),
];

/**
 * The tiled gradient image.
 *
 * `band` is the lit width as a share of the view; `imageRatio` how much wider
 * the image is than the view. The band occupies a narrow window in the middle
 * and everything either side is the base colour, so the letters stay filled in
 * every phase. Below an `imageRatio` of ~2.5 the neighbouring tile's band
 * creeps into frame.
 */
export function sheenGradient(band: number, imageRatio: number) {
  const half = (band / imageRatio) * 50;
  const edge = mix(DIM, PEAK, 0.38);
  return `linear-gradient(100deg,
  ${rgba(DIM)} 0%,
  ${rgba(DIM)} ${(50 - half).toFixed(2)}%,
  ${rgba(edge)} ${(50 - half * 0.42).toFixed(2)}%,
  ${rgba(PEAK)} 50%,
  ${rgba(edge)} ${(50 + half * 0.42).toFixed(2)}%,
  ${rgba(DIM)} ${(50 + half).toFixed(2)}%,
  ${rgba(DIM)} 100%)`;
}
