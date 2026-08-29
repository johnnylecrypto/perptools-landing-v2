import { cn } from "@/lib/utils";
import { formatMultiplier, formatPoints, type Bet } from "@/lib/prediction-engine";
import { CELL_EDGE } from "./cell-edges";
import { WinBurst } from "./win-burst";

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
 *  - a win swaps instantly to `var(--color-success-deep)`/`var(--color-success-bright)`,
 *    reprints as Win / +payout, punches to 1.3x, throws a `WinBurst`, then
 *    shrinks away;
 *  - a loss flinches once and fades, with no burst at all.
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
  // No "has this played" bookkeeping: a one-shot CSS animation fires when the
  // class first lands and does not restart on re-render, and the board
  // re-renders several times a second. The status flag is the trigger.
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
      className={cn(
        "relative aspect-square bg-board-cell",
        CELL_EDGE,
        stackable && "group cursor-pointer",
        // Raised while it celebrates: the burst rings reach three cells wide,
        // and cells painted later in the grid would otherwise cover them.
        won && "animate-win-vanish z-10",
      )}
    >
      <div
        className={cn(
          "absolute inset-[1px] flex flex-col items-center justify-center overflow-hidden rounded-[8px] border-[1.5px]",
          // No colour transition on the win: the design flips the badge on the
          // frame the bet resolves, and easing into green reads as lag.
          won &&
            "animate-cell-punch border-success bg-success-deep shadow-[0_0_16.2px_2.7px_--alpha(var(--color-success-glow)/90%),inset_0_0.675px_6.75px_--alpha(var(--color-success-glow)/35%)]",
          // A loss keeps its own fill and simply dims away — the design has no
          // separate red state, only the same cube at half opacity.
          lost && "animate-cell-flinch opacity-0 transition-opacity duration-[800ms]",
          !won &&
            bet.golden &&
            "border-warning bg-warning-fill bg-[image:var(--gradient-bet-golden)] shadow-[0_0_16px_2.025px_--alpha(var(--color-warning-fill)/90%),inset_0_1px_5px_--alpha(var(--color-warning-lift)/30%)]",
          !won &&
            !bet.golden &&
            (doubled
              ? cn(
                  "border-2 border-accent bg-[image:var(--gradient-accent-bright)] shadow-[0_0_14px_2px_var(--color-accent),inset_0_0.7px_5px_--alpha(var(--color-accent)/30%)]",
                  // Only a stacked cell you can still add to lifts on hover.
                  stackable &&
                    "group-hover:bg-[image:var(--gradient-accent-bright-hover)] group-focus-visible:bg-[image:var(--gradient-accent-bright-hover)]",
                )
              : "border-accent bg-[image:var(--gradient-bet)] shadow-[0_0_13.5px_2.025px_--alpha(var(--color-accent)/85%),inset_0_0.675px_5.4px_--alpha(var(--color-accent)/30%)]"),
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
            won ? "text-success" : dark ? "text-fg-on-accent" : "text-white",
          )}
        >
          {won ? "Win" : formatMultiplier(bet.multiplier)}
        </span>
        <span
          style={{ fontSize: font }}
          className={cn(
            "relative leading-none font-semibold tabular-nums",
            won ? "text-accent-orange" : dark ? "text-fg-on-accent" : "text-accent",
          )}
        >
          {won ? `+${formatPoints(bet.payout)}` : formatPoints(bet.stake * bet.multiplier)}
        </span>
      </div>

      {won ? <WinBurst payout={formatPoints(bet.payout)} /> : null}
    </Tag>
  );
}
