export type Geometry = {
  /** Visible grid columns. */
  columns: number;
  /** Price bands. */
  rows: number;
  /** 1-based visible column carrying the NOW playhead. */
  nowColumn: number;
  /**
   * Columns after the playhead that stay locked, mirroring the product's
   * `UNLOCK_TILES_AFTER`. Betting opens at `currentColumn + lockAhead`.
   */
  lockAhead: number;
  /** Type size inside a cell. */
  font: number;
  /** Height of the time strip above the grid. */
  strip: number;
};

/**
 * Cells stay square and the columns divide the available width, so the column
 * count sets the cell size and the row count then sets the board's height.
 *
 * Every board is quartered, which is what puts each region where it belongs:
 *
 *   |  chart  |  transit  |        multipliers        |
 *   0%       25%         50%                        100%
 *
 * `columns` is divisible by 4, the playhead sits on `columns / 4 + 1` (25%),
 * and `lockAhead` is another quarter of the columns so betting opens at 50%.
 * The middle quarter is the run-up: a staked cell crosses it on its way to the
 * NOW line, where it meets the chart and settles. Desktop keeps the design
 * file's 16 rows of squares.
 *
 * The phone board halves that instead: the mobile design gives the chart the
 * left 50% and the multiplier grid the right 50%, so the playhead sits on
 * `columns / 2 + 1` with a single locked column as the run-up.
 *
 * Its numbers come off the mobile design's own world, which is 20 columns of
 * 49.57px squares by 12 rows, seen through a 328.63px card — 6.63 columns at a
 * time. Cells are square and divide the card's width, so the count has to be a
 * whole number: seven columns puts a cell at 46.9px, within 5% of the drawn
 * square, where six would overshoot it by 10%. Twelve rows are the design's,
 * and the type is sized off the same drawing: 12.85px in a 49.57px cell is the
 * 0.26 ratio that gives 12px here.
 */
export const geometries = {
  // The phone strip is double height: the labels need the breathing room the
  // desktop board gets from its wider columns.
  phone: { columns: 7, rows: 12, nowColumn: 4, lockAhead: 1, font: 12, strip: 27 },
  tablet: { columns: 20, rows: 12, nowColumn: 6, lockAhead: 5, font: 9, strip: 13.5 },
  desktop: { columns: 28, rows: 16, nowColumn: 8, lockAhead: 7, font: 10.5, strip: 13.5 },
} satisfies Record<string, Geometry>;

export type GeometryName = keyof typeof geometries;
