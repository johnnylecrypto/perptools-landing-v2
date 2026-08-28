import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatPoints, timeLabel, type Bet } from "@/lib/prediction-engine";
import { CELL_EDGE, EMPTY_EDGE } from "./cell-edges";
import { BetCell } from "./bet-cell";
import { CellLabel } from "./cell-label";

/**
 * Grid hairlines, 0.75px in the design file. Settled cells carry the darker
 * `#061928`; live ones step up to `#122B3A`.
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
          golden ? "bg-[rgb(254_185_65/0.2)]" : "bg-[#061928]",
          CELL_EDGE,
        )}
      >
        <CellLabel font={font} className="text-[rgb(43_185_243/0.5)]">
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
        // An idle golden cube sits under a warm wash instead of the usual ink.
        golden ? "bg-[rgb(254_185_65/0.2)]" : "bg-[#061928]",
        CELL_EDGE,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        // The product's hover: a 2px cyan ring and a flat white 12% wash.
        !disabled &&
          (golden
            ? "hover:shadow-[inset_0_0_0_2px_#F6C14B] focus-visible:shadow-[inset_0_0_0_2px_#F6C14B]"
            : "hover:shadow-[inset_0_0_0_2px_#2BB9F3] focus-visible:shadow-[inset_0_0_0_2px_#2BB9F3]"),
      )}
    >
      {!disabled ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-colors duration-100 group-hover:bg-white/12 group-focus-visible:bg-white/12"
        />
      ) : null}
      <CellLabel
        font={font}
        className={cn(
          "transition-colors",
          golden
            ? "text-[#F6C14B]"
            : "text-[rgb(43_185_243/0.5)] group-hover:text-[#2BB9F3] group-focus-visible:text-[#2BB9F3]",
        )}
      >
        {label}
      </CellLabel>
    </button>
  );
});
