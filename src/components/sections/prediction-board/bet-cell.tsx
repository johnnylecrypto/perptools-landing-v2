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
 *  - a win turns `var(--color-success-deep)`/`var(--color-success-bright)`, punches once, and throws a score badge.
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
            "animate-cell-punch border-success-bright bg-success-deep shadow-[0_0_24px_--alpha(var(--color-success-bright)/45%)]",
          lost &&
            "border-danger/50 bg-[image:var(--gradient-bet-lost)] opacity-0 transition-opacity duration-[1600ms]",
          !won &&
            !lost &&
            bet.golden &&
            "border-warning bg-warning-fill shadow-[0_0_13.5px_--alpha(var(--color-warning)/60%)]",
          !won &&
            !lost &&
            !bet.golden &&
            (doubled
              ? "border-accent bg-[image:var(--gradient-accent-bright)] shadow-[0_0_14px_var(--color-accent)]"
              : "border-accent bg-[image:var(--gradient-bet)] shadow-[0_0_13.5px_--alpha(var(--color-accent)/85%)]"),
        )}
      >
        {won ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,--alpha(var(--color-success-bright)/25%)_0%,transparent_70%)]"
          />
        ) : null}

        {/* 9px medium over 10.5px semibold, as the design file sets them. */}
        <span
          style={{ fontSize: font - 1.5 }}
          className={cn(
            "relative leading-none font-medium",
            dark ? "text-fg-on-accent" : "text-white",
          )}
        >
          {formatMultiplier(bet.multiplier)}
        </span>
        <span
          style={{ fontSize: font }}
          className={cn(
            "relative leading-none font-semibold tabular-nums",
            won ? "text-success-light" : dark ? "text-fg-on-accent" : "text-accent",
          )}
        >
          {won ? formatPoints(bet.payout) : (bet.stake * bet.multiplier).toFixed(2)}
        </span>
      </div>

      {/* Payout badge rising out of the cell, as the live board throws it. */}
      {won ? (
        <span
          aria-hidden
          className="animate-score-rise text-success-light pointer-events-none absolute -top-2 left-1/2 z-[3] -translate-x-1/2 text-[15px] leading-none font-extrabold whitespace-nowrap [text-shadow:0_0_10px_--alpha(var(--color-success-bright)/60%)]"
        >
          + {formatPoints(bet.payout)}
        </span>
      ) : null}
    </Tag>
  );
}
