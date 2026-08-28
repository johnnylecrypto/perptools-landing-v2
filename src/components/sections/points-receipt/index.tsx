"use client";

import { useState } from "react";
import { platform } from "@/content/platform";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/icons/arrow";
import { CountUp } from "@/components/ui/count-up";
import { useInView } from "@/lib/use-in-view";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { FIRST_LINE, LINE_DELAY, TOTAL_LINE } from "./receipt-timing";
import { Line } from "./line";
import { Rule } from "./rule";

const { receipt } = platform;

/**
 * Phone stand-in for the points dashboard: a printed receipt hanging out of the
 * printer, the stats strip under it, and the CTA.
 *
 * The dashboard's six cards need columns a 358px screen does not have, so the
 * mobile design tells the same story in one printed slip. Figures are the
 * design file's sample values, labelled as such on the paper.
 *
 * It prints itself when scrolled to: the paper feeds out of the slot in steps,
 * the way a thermal printer advances, and each line appears as the head reaches
 * it. Tapping the slot reprints — `run` keys the paper, so the remount restarts
 * the CSS instead of any imperative reflow poking.
 */
export function PointsReceipt({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>("-10% 0px");
  const [run, setRun] = useState(0);

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* Bar and slip are one block so the parent's gap cannot open a seam
          between them. */}
      <div ref={ref} className={cn("receipt flex w-full flex-col", inView && "is-printing")}>
        {/* The slot, with the slip tucked half a bar-height behind it so it
            reads as still coming out of the printer. */}
        <button
          type="button"
          aria-label="Print the receipt again"
          onClick={() => setRun((value) => value + 1)}
          className="relative z-10 block h-[14px] w-full cursor-pointer rounded-full border border-white/16 bg-[linear-gradient(180deg,#2B2E30_0%,#323638_50%,#393E41_100%)] shadow-[inset_0_2px_5px_rgb(0_0_0/0.75)]"
        />

        {/* Clips the slip while it is still inside the printer; the padding is
            room for the torn edge, which hangs below the paper. */}
        <div className="relative z-0 -mt-[7px] w-full overflow-hidden pb-2">
          <div
            key={run}
            className="receipt-paper relative flex flex-col items-center gap-[10px] bg-[#EEF5FA] px-[18px] pt-[18px] pb-6 shadow-[0_24px_60px_rgb(0_0_0/0.55)]"
          >
            <Line index={0}>
              <p className="text-center font-mono text-[11px] font-bold tracking-[2.4px] text-[#0B1826]">
                {receipt.title}
              </p>
            </Line>
            <Line index={1}>
              <p className="text-center font-mono text-[8px] tracking-[2.1px] text-[#5A6E80]">
                {receipt.subtitle}
              </p>
            </Line>

            <Line index={2}>
              <Rule />
            </Line>

            {receipt.lines.map((line, index) => (
              <Line key={line.label} index={3 + index}>
                <p className="flex w-full items-center gap-2 overflow-hidden">
                  <span className="font-mono text-[10.5px] tracking-[0.2px] text-[#0B1826]">
                    {line.label}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-[#A9BCCB]" />
                  <span className="font-mono text-[10.5px] font-bold text-[#0E8F5F]">
                    {line.points}
                  </span>
                </p>
              </Line>
            ))}

            <Line index={TOTAL_LINE - 1}>
              <Rule />
            </Line>

            <Line index={TOTAL_LINE}>
              <p className="flex w-full items-baseline justify-between overflow-hidden">
                <span className="font-mono text-[10px] font-bold tracking-[2px] text-[#0B1826]">
                  {receipt.totalLabel}
                </span>
                <span className="flex items-baseline gap-1">
                  <CountUp
                    to={receipt.totalValue}
                    delay={(FIRST_LINE + TOTAL_LINE * LINE_DELAY) * 1000}
                    duration={900}
                    className="text-[33px] font-extrabold text-[#0B1826] tabular-nums"
                  />
                  <span className="font-mono text-[8.5px] tracking-[1.4px] text-[#5A6E80]">
                    {receipt.unit}
                  </span>
                </span>
              </p>
            </Line>

            <Line index={TOTAL_LINE + 1}>
              <p className="flex w-full items-center justify-between gap-2 rounded-md bg-[#DCEBF5] px-[11px] py-2">
                <span className="font-mono text-[9px] tracking-[1.3px] text-[#0B1826]">
                  {receipt.rankLabel}
                </span>
                <span className="font-mono text-[9px] font-bold tracking-[1.3px] text-[#0E76B4]">
                  {receipt.rank}
                </span>
              </p>
            </Line>

            <Line index={TOTAL_LINE + 2} className="flex justify-center">
              {/* Decorative barcode: the design's bar positions, not an encoding. */}
              <span aria-hidden className="relative block h-8 w-[122px]">
                {receipt.barcode.map(([left, width]) => (
                  <span
                    key={left}
                    className="absolute top-0 h-8 bg-[#0B1826]"
                    style={{ left, width }}
                  />
                ))}
              </span>
            </Line>

            <Line index={TOTAL_LINE + 3}>
              <p className="text-center font-mono text-[8px] tracking-[1.2px] text-[#8199AB]">
                {receipt.disclaimer}
              </p>
            </Line>

            {/* Cut line: the rule the tear runs along, so the serrated edge
                reads as the end of the slip rather than a ragged bottom. */}
            <Line index={TOTAL_LINE + 4}>
              <Rule />
            </Line>

            {/* Torn edge: triangles masked out of a strip of the paper, riding
                with it so the slip stays whole as it feeds. */}
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-2 translate-y-full bg-[#EEF5FA]"
              style={{
                maskImage:
                  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)",
                maskSize: "12px 100%",
                maskRepeat: "repeat-x",
                WebkitMaskImage:
                  "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg)",
                WebkitMaskSize: "12px 100%",
                WebkitMaskRepeat: "repeat-x",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-start overflow-hidden border-y border-white/9">
          {receipt.stats.map((stat) => (
            <p
              key={stat.label}
              className="flex flex-1 flex-col items-center gap-1.5 overflow-hidden py-[13px]"
            >
              <span className="text-[16px] font-bold" style={{ color: stat.color }}>
                {stat.value}
              </span>
              <span className="text-[10px] tracking-[1.2px] text-white/60">{stat.label}</span>
            </p>
          ))}
        </div>

        <Button href={site.links.app} className="h-13 w-full text-base font-bold">
          {receipt.cta}
          <ArrowIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
