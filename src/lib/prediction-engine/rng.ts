/**
 * One mulberry32 step. Returns the next seed alongside the value so callers can
 * thread the generator through reducer state instead of holding a closure.
 */
export function stepRng(state: number): { seed: number; value: number } {
  const seed = (state + 0x6d2b79f5) >>> 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { seed, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}
