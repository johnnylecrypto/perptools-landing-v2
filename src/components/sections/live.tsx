import { live } from "@/content/live";
import { Section } from "@/components/ui/section";
import { TerminalFrame } from "@/components/sections/terminal-frame";

export function Live() {
  return (
    <Section id="live" contained={false} className="overflow-hidden">
      <div className="frame w-full">
        <div className="flex w-full flex-col items-center gap-16">
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
