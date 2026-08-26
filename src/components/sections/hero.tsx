import Image from "next/image";
import { hero } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { GridLines } from "@/components/ui/grid-lines";
import { Ellipse } from "@/components/ui/ellipse";
import { PartnerMarquee } from "@/components/sections/partner-marquee";

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="bg-bg-0 relative isolate flex min-h-[810px] flex-col overflow-hidden"
    >
      <HeroBackdrop />

      {/* Copy block starts at y=289 with a 15px rhythm, per the design file. */}
      <div className="px-side relative flex flex-1 flex-col items-center gap-[15px] pt-[289px] text-center">
        <h1
          id="hero-heading"
          className="max-w-[792px] text-[clamp(38px,4.6vw,66px)] leading-none font-semibold text-balance text-white mix-blend-lighten"
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

        <div className="flex w-full flex-col items-center justify-center gap-3 pt-6 sm:w-auto sm:flex-row">
          <Button
            href={hero.primaryCta.href}
            className="h-13 w-full rounded-lg text-base font-bold text-[#080C12] sm:w-[179px]"
          >
            {hero.primaryCta.label}
            <ArrowIcon className="size-3.5" />
          </Button>
          <Button
            href={hero.secondaryCta.href}
            variant="ghost"
            className="h-13 w-full rounded-[10px] border-white/15 bg-white/5 text-base font-bold text-[#EDEEF0] backdrop-blur-[2.65px] sm:w-[184px]"
          >
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>

      <PartnerMarquee className="absolute inset-x-0 top-[717px]" />
    </section>
  );
}

/**
 * Layer stack, bottom to top:
 * noise → grid → glow blobs → logo art → bottom fade → god-rays video.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/15" />

      {/* One block spanning the full section height, inset by the same gutter
          as the content. The design file stacks two 610.5px blocks instead, but
          they overlap by 31px and leave a doubled-up band across the seam. */}
      <GridLines className="right-side left-side absolute inset-y-0 opacity-40 mix-blend-overlay" />

      {/* Glow and logo art stay inside the 1440 design frame instead of
          stretching on ultra-wide displays. */}
      {/* Centred with `inset-0 + mx-auto`, never a transform: a transform would
          create a stacking context, and the blended ellipses inside would then
          composite against nothing instead of the noise layer below. */}
      <div className="absolute inset-0 mx-auto w-full max-w-[1440px]">
        <Ellipse
          color="#094E6A"
          width={785.5034}
          height={700.7598}
          left={374.3438}
          top={-295.7617}
          radius={102.3364}
        />

        <Image
          src="/bg-removal.webp"
          alt=""
          width={917}
          height={786}
          priority
          sizes="(max-width: 768px) 100vw, 64vw"
          className="absolute top-[76px] left-[279px] w-[917px] opacity-60 select-none"
        />

        {/* Vignette so the headline keeps contrast over the logo art. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_38%_at_50%_46%,rgb(3_5_7/0.82)_0%,rgb(3_5_7/0.45)_55%,transparent_100%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[62px] bg-[linear-gradient(0deg,#05070A_0%,rgb(5_7_10/0)_100%)]" />

      {/* Noise grains everything below it in one pass. The design file has it as
          the container background (bottom of the stack), but there it only
          darkens the already near-black ground — the grain became visible only
          where the blended glows sit, i.e. the right half. */}
      <div className="absolute inset-0 bg-[url('/noise.webp')] bg-cover bg-center bg-no-repeat opacity-40" />

      {/* Square 1024 source: object-top keeps the rays anchored at their origin.
          Centred cover would crop 315px off the top on a 1440x810 desktop and
          cut the beams' source away. */}
      <video
        poster="/god-rays-still.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 size-full object-cover object-top opacity-35 mix-blend-screen motion-reduce:hidden"
      >
        <source src="/god-rays.webm" type="video/webm" />
        <source src="/god-rays.mp4" type="video/mp4" />
      </video>

      {/* Reduced motion gets the same light, held still, instead of nothing. */}
      <div className="absolute inset-0 hidden bg-[url('/god-rays-still.webp')] bg-cover bg-top opacity-35 mix-blend-screen motion-reduce:block" />
    </div>
  );
}
