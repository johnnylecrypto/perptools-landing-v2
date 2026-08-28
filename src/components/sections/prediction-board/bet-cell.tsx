import { cn } from "@/lib/utils";
import { formatMultiplier, formatPoints, type Bet } from "@/lib/prediction-engine";
import { CELL_EDGE } from "./cell-edges";

/**
 * A staked cell.
 *
 * The product insets it by 1px, rounds it to 7.5 and gives it a cyan drop glow,
 * then prints the odds above the *potential payout* — not the stake, so the
 * number you are playing for is the one you read.
 *
 * Three variants beyond the plain one, all from the live board:
 *  - stacked (`betCount >= 2`) burns brighter and flips to dark text;
 *  - golden pays the capped bonus and goes gold;
 *  - a win turns `#041a08`/`#00ff88`, punches once, and throws a score badge.
 */
export function BetCell({
  bet,
  font,
  stackable,
  row,
  column,
}: {
  bet: Bet;
  font: number;
  stackable: boolean;
  row: number;
  column: number;
}) {
  const won = bet.status === "won";
  const lost = bet.status === "lost";
  const doubled = bet.betCount >= 2;
  const dark = !won && (bet.golden || doubled);
  const Tag = stackable ? "button" : "div";

  return (
    <Tag
      {...(stackable
        ? {
            type: "button" as const,
            "data-cell": `${row}-${column}`,
            "aria-label": `Add ${formatMultiplier(bet.multiplier)} stake to this cell`,
          }
        : {})}
      data-bet="true"
      className={cn("relative aspect-square", CELL_EDGE, stackable && "cursor-pointer")}
    >
      <div
        className={cn(
          "absolute inset-[1px] flex flex-col items-center justify-center overflow-hidden rounded-[7.5px] border-2",
          won &&
            "animate-cell-punch border-[#00ff88] bg-[#041a08] shadow-[0_0_24px_rgb(0_255_136/0.45)]",
          lost &&
            "border-[#FF7578]/50 bg-[linear-gradient(180deg,#3A1015_0%,#120608_100%)] opacity-0 transition-opacity duration-[1600ms]",
          !won &&
            !lost &&
            bet.golden &&
            "border-[#F6C14B] bg-[#DEC05F] shadow-[0_0_13.5px_rgb(246_193_75/0.6)]",
          !won &&
            !lost &&
            !bet.golden &&
            (doubled
              ? "border-[#2BB9F3] bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] shadow-[0_0_14px_#2BB9F3]"
              : "border-[#2BB9F3] bg-[linear-gradient(180deg,#0070A9_0%,#061928_100%)] shadow-[0_0_13.5px_#2BB9F3D9]"),
        )}
      >
        {won ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(0_200_80/0.25)_0%,transparent_70%)]"
          />
        ) : null}

        {/* 9px medium over 10.5px semibold, as the design file sets them. */}
        <span
          style={{ fontSize: font - 1.5 }}
          className={cn(
            "relative leading-none font-medium",
            dark ? "text-[#050505]" : "text-white",
          )}
        >
          {formatMultiplier(bet.multiplier)}
        </span>
        <span
          style={{ fontSize: font }}
          className={cn(
            "relative leading-none font-semibold tabular-nums",
            won ? "text-[#8CF0C0]" : dark ? "text-[#050505]" : "text-[#2BB9F3]",
          )}
        >
          {won ? formatPoints(bet.payout) : (bet.stake * bet.multiplier).toFixed(2)}
        </span>
      </div>

      {/* Payout badge rising out of the cell, as the live board throws it. */}
      {won ? (
        <span
          aria-hidden
          className="animate-score-rise pointer-events-none absolute -top-2 left-1/2 z-[3] -translate-x-1/2 text-[15px] leading-none font-extrabold whitespace-nowrap text-[#8CF0C0] [text-shadow:0_0_10px_rgb(0_255_136/0.6)]"
        >
          + {formatPoints(bet.payout)}
        </span>
      ) : null}
    </Tag>
  );
}
