import { live } from "@/content/live";
import { Section } from "@/components/ui/section";
import { TerminalFrame } from "@/components/sections/terminal-frame";
import { TerminalLift } from "@/components/sections/terminal-lift";

export function Live() {
  return (
    // The page spaces sections with a gap; this one carries its own top padding
    // instead, so the section's own box — and the light it casts — starts right
    // where the hero ends. The negative margin cancels the page gap above it.
    <Section
      id="live"
      contained={false}
      className="-mt-16 overflow-hidden pt-16 sm:-mt-32 sm:pt-32"
    >
      <div className="frame w-full">
        <div className="flex w-full flex-col items-center gap-8 sm:gap-16">
          <header className="flex flex-col items-center gap-5 text-center sm:gap-[18.89px]">
            <h2
              id="live-heading"
              className="heading-sheen max-w-[874.88px] text-[32px] leading-[38.4px] font-medium text-balance sm:text-[clamp(30px,5vw,48px)] sm:leading-none"
            >
              {live.heading}
            </h2>
            <p className="max-w-[636.28px] text-[14px] leading-[23.86px] font-medium text-pretty text-[#7A8494] sm:text-[16px] sm:font-normal">
              {live.lede}
            </p>
          </header>

          {/* Phone mockup below sm, the wide terminal panel above it. */}
          <TerminalLift className="sm:hidden" />
          <TerminalFrame className="hidden sm:block" />
        </div>
      </div>
    </Section>
  );
}
