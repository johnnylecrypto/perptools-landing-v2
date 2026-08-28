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
    <div className="flex items-center justify-between gap-3 rounded-xl max-sm:px-3 max-sm:py-0 sm:bg-[#010101] sm:p-[9px] sm:shadow-[inset_0_0_0_0.75px_#122B3A]">
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
                ? "bg-[rgb(43_185_243/0.15)] shadow-[inset_0_0_0_0.75px_#2BB9F3]"
                : "bg-[#061928] shadow-[inset_0_0_0_0.75px_#122B3A] hover:bg-[#0B2E45]",
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
            <span className="hidden text-[9px] leading-3 font-medium text-[#3FD08B] sm:inline">
              {entry.change}
            </span>
          </button>
        ))}
      </div>

      {/* The design's phone header: three inert tiles where the desktop bar
          carries the feed badge and balance. Decorative, so they are not
          buttons and are hidden from assistive tech. */}
      <div aria-hidden className="flex items-center gap-3 sm:hidden">
        <span className="flex size-[29px] items-center justify-center rounded-[7px] bg-[rgb(246_193_75/0.15)] shadow-[inset_0_0_0_0.75px_rgb(246_193_75/0.15)] backdrop-blur-[13.77px]">
          <TrophyIcon />
        </span>
        <span className="flex size-[29px] items-center justify-center rounded-[7px] bg-[rgb(43_185_243/0.15)] shadow-[inset_0_0_0_0.75px_rgb(43_185_243/0.1)] backdrop-blur-[13.77px]">
          <GearIcon />
        </span>
        <span className="flex size-[29px] items-center justify-center rounded-[7px] bg-[rgb(43_185_243/0.15)] shadow-[inset_0_0_0_0.75px_rgb(43_185_243/0.1)] backdrop-blur-[13.77px]">
          <HistoryIcon />
        </span>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <FeedBadge status={feedStatus} />
        <p className="flex items-center gap-[3px] text-[10.5px] leading-[15px] whitespace-nowrap">
          <span className="hidden text-[#818689] sm:inline">Prediction Balance:</span>
          <span className="font-bold text-white tabular-nums">{formatPoints(balance)} PTS</span>
        </p>
        {/* Wallet actions are out of scope for a demo, so they only appear
            where there is room for them and stay decorative. */}
        <div aria-hidden className="hidden w-[231px] items-center gap-1.5 xl:flex">
          <span className="flex h-6 flex-1 items-center justify-center rounded-[4.5px] text-[10.5px] leading-[15px] font-bold text-[#2BB9F3] opacity-40 shadow-[inset_0_0_0_0.75px_#2BB9F3]">
            Withdraw
          </span>
          <span className="flex h-6 flex-1 items-center justify-center rounded-[4.5px] bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] text-[10.5px] leading-[15px] font-bold text-[#050505] opacity-40">
            Top Up
          </span>
        </div>
      </div>
    </div>
  );
}
