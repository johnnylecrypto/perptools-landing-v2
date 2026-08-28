import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { STAKE_STEPS, formatPoints } from "@/lib/prediction-engine";
import { CaretIcon } from "@/components/icons/caret";
import { PlusIcon } from "@/components/icons/plus";
import { WalletIcon } from "@/components/icons/wallet";

/**
 * Phone footer: balance on the left, stake on the right, per the mobile design.
 *
 * The balance pill is a readout — top-ups are out of scope for the demo — while
 * the stake pill opens the same steps the desktop stepper walks, so the board
 * stays playable without the stepper's width.
 */
export function PointsBar({
  balance,
  stake,
  onChange,
}: {
  balance: number;
  stake: number;
  onChange: (direction: 1 | -1) => void;
}) {
  const [open, setOpen] = useState(false);
  const index = STAKE_STEPS.indexOf(stake as (typeof STAKE_STEPS)[number]);

  return (
    <div className="mt-3 flex items-center justify-between px-3 sm:hidden">
      <p className="bg-accent/15 flex h-[29px] items-center gap-[7px] rounded-[7px] px-[7px] shadow-[inset_0_0_0_0.75px_--alpha(var(--color-accent)/15%)] backdrop-blur-[13.77px]">
        <span className="flex items-center gap-[4px]">
          <WalletIcon />
          <span className="text-[13px] leading-[18px] font-bold text-white tabular-nums">
            {formatPoints(balance)} PTS
          </span>
        </span>
        <PlusIcon />
      </p>

      <div
        className="relative"
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
          className="flex h-[29px] cursor-pointer items-center gap-[14px] rounded-[7px] bg-white/15 px-[7px] shadow-[inset_0_0_0_0.75px_--alpha(var(--color-white)/15%)] backdrop-blur-[13.77px]"
        >
          <span className="flex items-center gap-[4px]">
            <Image
              src="/tokens/coin-pts.png"
              alt=""
              width={18}
              height={18}
              className="size-[18px] rounded-full"
            />
            <span className="text-[13px] leading-[18px] font-bold text-white tabular-nums">
              {formatPoints(stake)} PTS
            </span>
          </span>
          <span className="sr-only">Stake</span>
          <CaretIcon open={open} />
        </button>

        {open ? (
          <ul
            role="listbox"
            className="bg-board-cell absolute right-0 bottom-[calc(100%+4px)] z-20 min-w-[96px] rounded-md p-1 shadow-[inset_0_0_0_0.75px_var(--color-board-line),0_8px_24px_--alpha(var(--color-black)/60%)]"
          >
            {STAKE_STEPS.map((step, stepIndex) => (
              <li key={step}>
                <button
                  type="button"
                  role="option"
                  aria-selected={step === stake}
                  onClick={() => {
                    // The reducer walks the steps one at a time, so a jump is
                    // that many single steps in the chosen direction.
                    const delta = stepIndex - index;
                    for (let i = 0; i < Math.abs(delta); i += 1) onChange(delta > 0 ? 1 : -1);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[4px] px-1.5 py-1 text-left transition-colors",
                    step === stake ? "bg-accent/15" : "hover:bg-white/5",
                  )}
                >
                  <span className="text-[10.5px] leading-[15px] font-semibold text-white tabular-nums">
                    {formatPoints(step)}
                  </span>
                  <span className="text-[9px] leading-3 font-medium text-white/60">PTS</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
