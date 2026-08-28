/** Verbatim from the product's `GOLDEN_CELL`. */
export const GOLDEN_CELL = { bonus: 2, maxMultiplier: 15 } as const;

/** Roughly one golden cell every this many columns. */
const GOLDEN_EVERY = 7;

/** Cheap integer hash, so the golden cell is a pure function of its column. */
function hash32(value: number) {
  let h = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Row carrying the golden cell in `column`, or null.
 *
 * The live board is told where the golden cube is over the wire; the demo
 * derives it from the column index instead, which keeps it deterministic and
 * needs no extra state.
 */
export function goldenRowFor(column: number, rows: number): number | null {
  const h = hash32(column);
  if (h % GOLDEN_EVERY !== 0) return null;
  return (h >>> 8) % rows;
}

export function isGoldenCell(row: number, column: number, rows: number) {
  return goldenRowFor(column, rows) === row;
}

/** Golden bonus: doubled, capped, and never below the base rate. */
export function applyGolden(multiplier: number) {
  return Math.max(multiplier, Math.min(multiplier * GOLDEN_CELL.bonus, GOLDEN_CELL.maxMultiplier));
}
