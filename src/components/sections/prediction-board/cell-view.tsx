import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatPoints, timeLabel, type Bet } from "@/lib/prediction-engine";
import { CELL_EDGE, EMPTY_EDGE, GOLD_EDGE } from "./cell-edges";
import { BetCell } from "./bet-cell";
import { CellLabel } from "./cell-label";

/**
 * Grid hairlines, 0.75px in the design file. Settled cells carry the darker
 * `var(--color-board-cell)`; live ones step up to `var(--color-board-line)`.
 */
type CellProps = {
  row: number;
  column: number;
  kind: "settled" | "locked" | "open";
  /** Pre-formatted odds; empty for a settled cell or one holding a bet. */
  label: string;
  golden: boolean;
  font: number;
  stake: number;
  timeOffset: number;
  bet: Bet | undefined;
  stackable: boolean;
  disabled: boolean;
  focused: boolean;
};

/**
 * One grid cell.
 *
 * Memoised on primitives. The board reprices continuously, but a given cell's
 * printed odds change far less often than that, so this is what keeps a tick
 * from reconciling the whole grid and dropping a frame mid-scroll.
 */
export const CellView = memo(function CellView({
  row,
  column,
  kind,
  label,
  golden,
  font,
  stake,
  timeOffset,
  bet,
  stackable,
  disabled,
  focused,
}: CellProps) {
  if (bet) {
    return <BetCell bet={bet} font={font} stackable={stackable} row={row} column={column} />;
  }

  // Settled columns and the one still resolving render as bare grid.
  if (kind === "settled") {
    return <div className={cn("aspect-square", EMPTY_EDGE)} />;
  }

  if (kind === "locked") {
    return (
      <div
        className={cn(
          "relative aspect-square opacity-50",
          CELL_EDGE,
          golden
            ? "border-transparent bg-warning-wash/20 shadow-[inset_0_0_0_1.5px_--alpha(var(--color-warning-wash)/20%)]"
            : "bg-board-cell",
        )}
      >
        <CellLabel font={font} className="text-white/70">
          {label}
        </CellLabel>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-cell={`${row}-${column}`}
      tabIndex={focused ? 0 : -1}
      disabled={disabled}
      aria-label={`Stake ${formatPoints(stake)} points on ${label} band, ${timeLabel(timeOffset)}`}
      className={cn(
        "group relative aspect-square",
        // An idle golden cube sits under a warm wash instead of the usual ink,
        // painted by the breathing layer below. On hover that wash clears and
        // the board ink returns, so the plate's 30% gold is exactly 30%.
        golden
          ? "bg-transparent hover:bg-board-cell focus-visible:bg-board-cell"
          : "bg-board-cell",
        golden ? GOLD_EDGE : CELL_EDGE,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      {/* An idle golden cube breathes so it is findable in a grid of cyan. */}
      {golden ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-warning-wash/20 transition-opacity duration-100",
            "shadow-[inset_0_0_0_1.5px_--alpha(var(--color-warning-wash)/20%)]",
            !disabled &&
              "animate-gold-pulse group-hover:animate-none group-hover:opacity-0 group-focus-visible:animate-none group-focus-visible:opacity-0",
          )}
        />
      ) : null}

      {/* The hover plate: an inset, 8px-rounded box that lights up over the
          square grid cell, which itself stays sharp-cornered. */}
      {!disabled ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-[1px] rounded-[8px] opacity-0 transition-opacity duration-100",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
            golden
              ? "bg-warning-wash/30 shadow-[0_0_10px_--alpha(var(--color-warning)/60%),inset_0_0_0_1.5px_--alpha(var(--color-warning)/60%)]"
              : "bg-board-line shadow-[0_0_10px_0.675px_--alpha(var(--color-accent)/40%),inset_0_0_0_1.5px_--alpha(var(--color-accent)/50%)]",
          )}
        />
      ) : null}
      <CellLabel
        font={font}
        className={cn(
          "transition-colors",
          golden
            ? "text-warning"
            : "text-white/75 group-hover:text-accent-hover group-focus-visible:text-accent-hover",
        )}
      >
        {label}
      </CellLabel>
    </button>
  );
});
