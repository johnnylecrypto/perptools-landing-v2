import Image from "next/image";
import { points } from "@/content/points";
import { cn } from "@/lib/utils";
import { formatPoints } from "@/lib/prediction-engine";
import type { FeedStatus } from "@/lib/price-feed";
import { GearIcon } from "@/components/icons/gear";
import { HistoryIcon } from "@/components/icons/history";
import { TrophyIcon } from "@/components/icons/trophy";
import { FeedBadge } from "./feed-badge";
import { MarketMenu } from "./market-menu";

export function MarketBar({
  marketIndex,
  balance,
  feedStatus,
  onSelect,
}: {
  marketIndex: number;
  balance: number;
  feedStatus: FeedStatus;
  onSelect: (index: number) => void;
}) {
  return (
    // On phones the bar is a bare row, per the design — the framed card only
    // starts once the feed badge and balance join it.
    <div className="sm:bg-board-bg flex items-center justify-between gap-3 rounded-xl max-sm:px-3 max-sm:py-0 sm:p-[9px] sm:shadow-[inset_0_0_0_0.75px_var(--color-board-line)]">
      {/* Phones get the design's dropdown; the pills need room the mobile card
          does not have. */}
      <MarketMenu marketIndex={marketIndex} onSelect={onSelect} />

      <div className="hidden items-center gap-1.5 sm:flex">
        {points.markets.map((entry, index) => (
          <button
            key={entry.symbol}
            type="button"
            aria-pressed={index === marketIndex}
            onClick={() => onSelect(index)}
            className={cn(
              "flex h-6 cursor-pointer items-center gap-[3px] rounded-md px-1.5 py-[4.5px] transition-colors",
              index === marketIndex
                ? "bg-accent/15 shadow-[inset_0_0_0_0.75px_var(--color-accent)]"
                : "bg-board-cell hover:bg-board-line-hover shadow-[inset_0_0_0_0.75px_var(--color-board-line)]",
            )}
          >
            <Image src={entry.logo} alt="" width={12} height={12} className="size-3" />
            <span
              className={cn(
                "text-[10.5px] leading-[15px] font-semibold",
                index === marketIndex ? "text-white" : "text-white/87",
              )}
            >
              {entry.symbol}
            </span>
            <span className="text-success hidden text-[9px] leading-3 font-medium sm:inline">
              {entry.change}
            </span>
          </button>
        ))}
      </div>

      {/* The design's phone header: three inert tiles where the desktop bar
          carries the feed badge and balance. Decorative, so they are not
          buttons and are hidden from assistive tech. */}
      <div aria-hidden className="flex items-center gap-3 sm:hidden">
        <span className="bg-warning/15 flex size-[29px] items-center justify-center rounded-[7px] shadow-[inset_0_0_0_0.75px_--alpha(var(--color-warning)/15%)] backdrop-blur-[13.77px]">
          <TrophyIcon />
        </span>
        <span className="bg-accent/15 flex size-[29px] items-center justify-center rounded-[7px] shadow-[inset_0_0_0_0.75px_--alpha(var(--color-accent)/10%)] backdrop-blur-[13.77px]">
          <GearIcon />
        </span>
        <span className="bg-accent/15 flex size-[29px] items-center justify-center rounded-[7px] shadow-[inset_0_0_0_0.75px_--alpha(var(--color-accent)/10%)] backdrop-blur-[13.77px]">
          <HistoryIcon />
        </span>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <FeedBadge status={feedStatus} />
        <p className="flex items-center gap-[3px] text-[10.5px] leading-[15px] whitespace-nowrap">
          <span className="text-fg-subtle hidden sm:inline">Prediction Balance:</span>
          <span className="font-bold text-white tabular-nums">{formatPoints(balance)} PTS</span>
        </p>
        {/* Wallet actions are out of scope for a demo, so they only appear
            where there is room for them and stay decorative. */}
        <div aria-hidden className="hidden w-[231px] items-center gap-1.5 xl:flex">
          <span className="text-accent flex h-6 flex-1 items-center justify-center rounded-[4.5px] text-[10.5px] leading-[15px] font-bold opacity-40 shadow-[inset_0_0_0_0.75px_var(--color-accent)]">
            Withdraw
          </span>
          <span className="text-fg-on-accent flex h-6 flex-1 items-center justify-center rounded-[4.5px] bg-[image:var(--gradient-accent-bright)] text-[10.5px] leading-[15px] font-bold opacity-40">
            Top Up
          </span>
        </div>
      </div>
    </div>
  );
}
