/**
 * Closest item whose center sits within `threshold` of the container center.
 * Returns null when none qualify.
 */
export function pickActiveIndex(
  itemCenters: readonly number[],
  containerCenter: number,
  threshold: number,
): number | null {
  let best: number | null = null;
  let bestDist = Infinity;

  for (let i = 0; i < itemCenters.length; i++) {
    const dist = Math.abs(itemCenters[i]! - containerCenter);
    if (dist < threshold && dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }

  return best;
}
