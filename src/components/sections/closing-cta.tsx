import Image from "next/image";
import { closingCta } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { Ellipse } from "@/components/ui/ellipse";

export function ClosingCta() {
  return (
    <section id="get-started" aria-labelledby="get-started-heading" className="py-section frame">
      <div className="mx-auto w-full">
        <div className="relative isolate overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(105deg,#05090C_0%,#071119_55%,#0A1A26_100%)]">
          <Ellipse
            color="linear-gradient(180deg, rgb(0 173 239 / 0.12) 55%, rgb(157 179 198 / 0.12) 100%)"
            width={536.73}
            height={488.49}
            left={-257}
            top={-282}
            blur={96.49}
            blend="normal"
            className="-z-10"
          />

          <Image
            src="/market-banner.webp"
            alt=""
            width={381}
            height={243}
            sizes="381px"
            aria-hidden
            className="pointer-events-none absolute top-1/2 -right-14 -z-10 hidden w-[381px] max-w-none -translate-y-1/2 select-none sm:block"
          />

          <div className="flex flex-col gap-10 px-6 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-[clamp(32px,5vw,70px)]">
            <div className="w-full max-w-full lg:w-[625px]">
              <h2
                id="get-started-heading"
                className="text-[clamp(28px,3vw,44px)] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white"
              >
                {closingCta.heading}
              </h2>
              <p className="mt-4 max-w-[440px] text-[16px] leading-[22px] text-pretty text-[#7A8494]">
                {closingCta.lede}
              </p>
            </div>

            <Button href={closingCta.cta.href} className="shrink-0 sm:min-w-[200px]">
              {closingCta.cta.label}
              <ArrowIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
