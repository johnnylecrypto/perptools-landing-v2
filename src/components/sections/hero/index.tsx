import { hero } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/icons/arrow";
import { HeroBackdrop } from "./hero-backdrop";
import { PartnerMarqueeLazy } from "./partner-marquee-lazy";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-bg-0 relative isolate flex h-dvh flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] max-sm:h-auto max-sm:min-h-dvh"
    >
      <HeroBackdrop />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between">
        <div className="px-side flex flex-col gap-[clamp(1.5rem,7.2dvh,4rem)] pt-[clamp(3rem,min(47.2vw,20.8dvh),11.5rem)] text-left max-sm:pb-8 sm:min-h-0 sm:flex-1 sm:items-center sm:justify-center sm:gap-[15px] sm:pt-20 sm:pb-0 sm:text-center lg:pt-20">
          <div className="flex flex-col items-start gap-8 sm:items-center sm:gap-[15px]">
            <h1
              id="hero-heading"
              className="max-w-[792px] text-[clamp(44px,17vw,66px)] leading-none font-semibold text-balance text-white mix-blend-lighten max-sm:mix-blend-normal sm:text-[clamp(38px,4.6vw,66px)]"
            >
              {hero.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <p className="text-fg max-w-[495px] text-[15px] leading-[19.5px] text-pretty">
              {hero.lede}
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-3">
            <Button
              href={hero.primaryCta.href}
              analyticsEvent="landing_hero_launch_app"
              className="text-bg-2 h-13 w-full text-base font-bold sm:w-[179px]"
            >
              {hero.primaryCta.label}
              <ArrowIcon className="size-3.5" />
            </Button>
            <Button
              href={hero.secondaryCta.href}
              analyticsEvent="landing_hero_explore_points"
              variant="ghost"
              className="text-fg h-13 w-full border-white/15 bg-white/5 text-base font-bold backdrop-blur-[2.65px] sm:w-[184px]"
            >
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <PartnerMarqueeLazy className="shrink-0" />
      </div>
    </section>
  );
}
