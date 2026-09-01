import dynamic from "next/dynamic";
import { closingCta } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/icons/arrow";
import { Ellipse } from "@/components/ui/ellipse";

const CtaDotField = dynamic(() => import("./cta-dot-field").then((module) => module.CtaDotField), {
  loading: () => null,
});

export function ClosingCta() {
  return (
    <section id="get-started" aria-labelledby="get-started-heading" className="frame">
      <div className="mx-auto w-full">
        <div className="relative isolate overflow-hidden rounded-[20px] border border-white/8 bg-[image:var(--gradient-cta-card)]">
          <Ellipse
            color="linear-gradient(180deg, color-mix(in oklab, var(--color-accent) 12%, transparent) 55%, color-mix(in oklab, var(--color-fg-muted) 12%, transparent) 100%)"
            width={536.73}
            height={488.49}
            left={-257}
            top={-282}
            blur={96.49}
            blend="normal"
            className="-z-10"
          />
          <CtaDotField className="sm:hidden" />
          <CtaDotField variant="bleed" className="hidden lg:block" />

          <div className="flex flex-col gap-4 p-4 sm:gap-10 sm:px-8 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-[clamp(32px,5vw,70px)]">
            {/* box the dot-field logo is drawn into — resize it to resize the mark */}
            <span
              data-dot-mark
              aria-hidden
              className="block h-[105px] w-[120px] self-center sm:hidden"
            />

            <div className="w-full max-w-full lg:w-[625px]">
              <h2
                id="get-started-heading"
                className="text-[26px] leading-[1.1] font-medium tracking-[-0.02em] whitespace-nowrap text-white sm:text-[clamp(28px,3vw,44px)] sm:text-balance"
              >
                {closingCta.heading}
              </h2>
              <p className="text-fg-subtle mt-[12.5px] max-w-[440px] text-[14px] leading-[22px] text-pretty sm:mt-4 sm:text-[16px]">
                {closingCta.lede}
              </p>
            </div>

            <Button
              data-dot-act
              href={closingCta.cta.href}
              analyticsEvent="landing_bottom_menu_launch_app"
              className="mt-4 h-13 w-full shrink-0 text-base font-bold sm:mt-0 sm:h-14 sm:w-auto sm:min-w-[200px]"
            >
              {closingCta.cta.label}
              <ArrowIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
