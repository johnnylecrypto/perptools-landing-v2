/**
 * Grid hairlines, 0.75px in the design file. Settled cells carry the darker
 * var(--color-board-cell); live ones step up to var(--color-board-line).
 */

export const EMPTY_EDGE = "border-t-[0.75px] border-l-[0.75px] border-board-cell";

export const CELL_EDGE = "border-t-[0.75px] border-l-[0.75px] border-board-line";

/**
 * A golden cell draws its own 1.5px gold edge instead, so it carries the grid
 * hairline only once hovered — where the design puts the board line back
 * underneath the rounded gold plate.
 */
export const GOLD_EDGE =
  "border-t-[0.75px] border-l-[0.75px] border-transparent group-hover:border-board-line group-focus-visible:border-board-line";
