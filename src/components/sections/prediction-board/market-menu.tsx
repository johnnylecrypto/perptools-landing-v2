import { useState } from "react";
import Image from "next/image";
import { points } from "@/content/points";
import { cn } from "@/lib/utils";
import { CaretIcon } from "@/components/icons/caret";

/**
 * Market picker for phones: a button that opens the list below it.
 *
 * Closes on select, on Escape, and when focus leaves the group — no document
 * listener, so nothing outlives the component.
 */
export function MarketMenu({
  marketIndex,
  onSelect,
}: {
  marketIndex: number;
  onSelect: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = points.markets[marketIndex];

  return (
    <div
      className="relative sm:hidden"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="bg-accent/15 flex h-[29px] cursor-pointer items-center gap-[4px] rounded-[7px] px-[7px] shadow-[inset_0_0_0_0.75px_var(--color-accent)]"
      >
        <Image src={current.logo} alt="" width={15} height={15} className="size-[15px]" />
        <span className="sr-only">{current.symbol}</span>
        <span className="text-success text-[13px] leading-[18px] font-bold">{current.change}</span>
        <CaretIcon open={open} />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="bg-board-cell absolute top-[calc(100%+4px)] left-0 z-20 min-w-[104px] rounded-md p-1 shadow-[inset_0_0_0_0.75px_var(--color-board-line),0_8px_24px_--alpha(var(--color-black)/60%)]"
        >
          {points.markets.map((entry, index) => (
            <li key={entry.symbol}>
              <button
                type="button"
                role="option"
                aria-selected={index === marketIndex}
                onClick={() => {
                  onSelect(index);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-[5px] rounded-[4px] px-1.5 py-1 text-left transition-colors",
                  index === marketIndex ? "bg-accent/15" : "hover:bg-white/5",
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
                <span className="text-success ml-auto text-[9px] leading-3 font-medium">
                  {entry.change}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
