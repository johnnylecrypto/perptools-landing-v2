import { hero } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/icons/arrow";
import { PartnerMarquee } from "@/components/sections/partner-marquee";
import { HeroBackdrop } from "./hero-backdrop";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-bg-0 relative isolate flex min-h-[min(884px,100svh)] flex-col overflow-hidden sm:min-h-[640px] lg:min-h-[810px]"
    >
      <HeroBackdrop />

      {/* Desktop: centred copy starting at y=289 with a 15px rhythm. Mobile: the
          design left-aligns the block at y=194 with a 32px heading→lede gap, and
          `pb-28` reserves the marquee strip at the bottom. */}
      <div className="px-side relative flex flex-1 flex-col items-start gap-8 pt-[194px] pb-28 text-left sm:items-center sm:gap-[15px] sm:pt-[220px] sm:pb-32 sm:text-center lg:pt-[289px]">
        <h1
          id="hero-heading"
          className="max-w-[792px] text-[clamp(44px,17vw,66px)] leading-none font-semibold text-balance text-white mix-blend-lighten sm:text-[clamp(38px,4.6vw,66px)]"
        >
          {hero.heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <p className="font-inter max-w-[495px] text-[15px] leading-[19.5px] text-pretty text-[#EBEBEB]">
          {hero.lede}
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 pt-8 sm:w-auto sm:flex-row sm:gap-3 sm:pt-6">
          <Button
            href={hero.primaryCta.href}
            className="h-13 w-full text-base font-bold text-[#080C12] sm:w-[179px]"
          >
            {hero.primaryCta.label}
            <ArrowIcon className="size-3.5" />
          </Button>
          <Button
            href={hero.secondaryCta.href}
            variant="ghost"
            className="h-13 w-full border-white/15 bg-white/5 text-base font-bold text-[#EDEEF0] backdrop-blur-[2.65px] sm:w-[184px]"
          >
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>

      <PartnerMarquee className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
