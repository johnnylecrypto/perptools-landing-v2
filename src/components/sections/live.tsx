import Image from "next/image";
import { live } from "@/content/live";
import { Section } from "@/components/ui/section";

export function Live() {
  return (
    <Section id="live" contained={false} className="overflow-hidden">
      <div className="px-side w-full lg:px-[85px]">
        {/* 85px section gutter + 96.5px inner padding = the design's 1080 content frame. */}
        <div className="flex w-full flex-col items-center gap-16 lg:px-[96.5px]">
          <header className="flex flex-col items-center gap-[18.89px] text-center">
            <h2
              id="live-heading"
              className="max-w-[874.88px] text-[clamp(30px,5vw,48px)] leading-[1.05] font-medium text-balance text-white mix-blend-lighten"
            >
              {live.heading}
            </h2>
            <p className="max-w-[636.28px] text-[16px] leading-[23.86px] text-pretty text-[#7A8494]">
              {live.lede}
            </p>
          </header>

          <TerminalFrame />
        </div>
      </div>
    </Section>
  );
}

/**
 * Glass frame around the terminal shot: 9px inner padding, a hairline white
 * outline drawn inwards, a wide cyan glow behind the top edge, and a fade that
 * dissolves the bottom of the screenshot into the page.
 */
function TerminalFrame() {
  return (
    <div className="w-full pb-[90px]">
      {/* The design's 1.8px inset outline: Chrome rounds `outline-width` to whole
          pixels, so an inset box-shadow is what actually renders 1.8px. */}
      <div className="relative flex flex-col rounded-[18px] bg-white/10 p-[9px] shadow-[inset_0_0_0_1.8px_#fff]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[9.26px] left-[5.6%] h-[319px] w-[85%] bg-[linear-gradient(178deg,#3DBCE7_0%,rgb(13_136_187/0.53)_100%)] blur-[112.49px]"
        />

        <div className="relative w-full overflow-hidden rounded-[10.12px]">
          <Image
            src={live.screenshot}
            alt="PERPTools trading terminal showing routed perpetual positions against a single margin balance"
            width={1062}
            height={545}
            sizes="(max-width: 1080px) 100vw, 1062px"
            className="h-auto w-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[79px] rounded-b-[18px] bg-[linear-gradient(359deg,#05080B_0%,rgb(5_8_11/0)_100%)]"
        />
      </div>
    </div>
  );
}
