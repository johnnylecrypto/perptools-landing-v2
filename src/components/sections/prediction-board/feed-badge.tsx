import { cn } from "@/lib/utils";
import type { FeedStatus } from "@/lib/price-feed";

/**
 * Where the prices are coming from.
 *
 * Worth showing plainly: the board falls back to a simulated walk when the feed
 * cannot be reached, and a viewer should be able to tell which one they are
 * looking at rather than assume the numbers are real.
 */
export function FeedBadge({ status }: { status: FeedStatus }) {
  const label = status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Simulated";
  const tone =
    status === "live"
      ? "bg-[rgb(63_208_139/0.15)] text-[#3FD08B]"
      : status === "connecting"
        ? "bg-[rgb(235_189_78/0.15)] text-[#EBBD4E]"
        : "bg-white/8 text-white/50";

  return (
    <span
      title={
        status === "live"
          ? "Real BTC/ETH/BNB prices from Binance"
          : status === "offline"
            ? "Price feed unreachable — showing a simulated market"
            : "Connecting to the price feed"
      }
      className={cn(
        "flex h-[18px] items-center gap-[5px] rounded-full px-2 text-[9px] leading-3 font-bold tracking-[0.5px] uppercase",
        tone,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full bg-current", status === "live" && "animate-pulse")}
      />
      {label}
    </span>
  );
}
