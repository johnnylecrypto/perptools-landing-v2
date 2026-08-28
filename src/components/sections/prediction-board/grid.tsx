import { memo, useCallback, useRef, useState } from "react";
import {
  applyGolden,
  formatMultiplier,
  isGoldenCell,
  multiplierFor,
  rowOf,
  type Bet,
  type Geometry,
  type Ladder,
} from "@/lib/prediction-engine";
import { CellView } from "./cell-view";

type GridProps = {
  geometry: Geometry;
  col0: number;
  currentCol: number;
  playFrom: number;
  ladder: Ladder;
  /** Spot, quantised to its band so the grid only reprices on a band change. */
  price: number;
  /** Realised volatility, quantised for the same reason. */
  sigma: number;
  stake: number;
  bets: readonly Bet[];
  disabled: boolean;
  onBet: (row: number, column: number) => void;
};

const identity = <T,>(value: T) => value;

/**
 * Memoised: the reducer ticks four times per column, but the grid only changes
 * when the window scrolls, the price crosses a band, or a bet moves.
 */
export const Grid = memo(function Grid({
  geometry,
  col0,
  currentCol,
  playFrom,
  ladder,
  price,
  sigma,
  stake,
  bets,
  disabled,
  onBet,
}: GridProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Roving tabindex in *visible* coordinates, so the focused cell stays put
  // while the world scrolls underneath it.
  const firstPlayable = playFrom - col0;
  const [focus, setFocus] = useState({
    row: Math.floor(geometry.rows / 2),
    column: firstPlayable,
  });

  const move = useCallback(
    (rowDelta: number, columnDelta: number) => {
      setFocus((current) => {
        const row = Math.min(geometry.rows - 1, Math.max(0, current.row + rowDelta));
        const column = Math.min(
          // The world carries a spare column past the panel edge; it is on
          // screen only mid-scroll, so keyboard focus stays out of it.
          geometry.columns - 1,
          Math.max(firstPlayable, current.column + columnDelta),
        );
        ref.current?.querySelector<HTMLButtonElement>(`[data-cell="${row}-${column}"]`)?.focus();
        return { row, column };
      });
    },
    [geometry.rows, geometry.columns, firstPlayable],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    move(delta[0], delta[1]);
  };

  /** Read `row-column` off whichever cell an event came from. */
  const coordsOf = (event: React.SyntheticEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return null;
    const [row, column] = cell.dataset.cell!.split("-").map(Number);
    return { row, column };
  };

  // Click and focus are handled here rather than per cell. That keeps every
  // cell's props primitive, which is what lets `CellView` memoise: a tick that
  // moves one multiplier then re-renders one cell instead of four hundred.
  const onClick = (event: React.MouseEvent) => {
    const at = coordsOf(event);
    if (at) onBet(at.row, col0 + at.column);
  };

  const onFocus = (event: React.FocusEvent) => {
    const at = coordsOf(event);
    if (at) setFocus(at);
  };

  // Keyed by where each bet sits on the ladder *now*: the ladder shifts under
  // the price, so a bet's row is not the one it was placed on.
  const byCell = new Map(
    bets.map((bet) => [`${rowOf(bet, ladder, geometry.rows)}-${bet.column}`, bet]),
  );

  return (
    <div
      ref={ref}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
      aria-label="Prediction grid: price bands by time window"
      className="grid"
      style={{ gridTemplateColumns: `repeat(${geometry.columns + 1}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: geometry.rows }, (_, row) =>
        Array.from({ length: geometry.columns + 1 }, (_, column) => {
          const absolute = col0 + column;
          const bet = byCell.get(`${row}-${absolute}`);
          const settled = absolute < playFrom - 1;
          const golden = !settled && isGoldenCell(row, absolute, geometry.rows);

          // Priced here, not inside the cell, and rounded to what actually gets
          // printed — so a cell only re-renders when its visible odds change.
          const label =
            settled || bet
              ? ""
              : formatMultiplier(
                  (golden ? applyGolden : identity)(
                    multiplierFor(row, absolute - currentCol, price, sigma, ladder, geometry.rows),
                  ),
                );

          return (
            <CellView
              key={`${row}-${column}`}
              row={row}
              column={column}
              kind={settled ? "settled" : absolute === playFrom - 1 ? "locked" : "open"}
              label={label}
              golden={golden}
              font={geometry.font}
              stake={stake}
              timeOffset={column - (geometry.nowColumn - 1)}
              bet={bet}
              stackable={!!bet && bet.status === "pending" && absolute >= playFrom && !disabled}
              disabled={disabled}
              focused={focus.row === row && focus.column === column}
            />
          );
        }),
      )}
    </div>
  );
});
