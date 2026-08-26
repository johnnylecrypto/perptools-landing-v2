import { closingCta, hero } from "@/content/hero";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";
import { ArrowIcon } from "@/components/ui/arrow-icon";

export function ClosingCta() {
  return (
    <Section id="get-started" className="bg-bg-1 overflow-hidden">
      <div
        aria-hidden
        className="bg-accent/8 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
      />
      <div className="flex flex-col items-center text-center">
        <Eyebrow>{closingCta.eyebrow}</Eyebrow>
        <SectionHeading id="get-started" lines={closingCta.heading} className="mt-6" />
        <p className="text-fg-muted mt-6 max-w-2xl leading-relaxed text-pretty">
          {closingCta.lede}
        </p>
        <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Button href={hero.primaryCta.href} className="sm:min-w-[200px]">
            {hero.primaryCta.label}
            <ArrowIcon className="size-3.5" />
          </Button>
          <Button href={hero.secondaryCta.href} variant="ghost" className="sm:min-w-[200px]">
            {hero.secondaryCta.label}
          </Button>
        </div>
      </div>
    </Section>
  );
}
