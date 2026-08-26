import { howItWorks } from "@/content/how-it-works";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";

export function HowItWorks() {
  return (
    <Section id="how-it-works" className="bg-bg-1">
      <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
      <SectionHeading id="how-it-works" lines={howItWorks.heading} className="mt-6" />
      <p className="text-fg-muted mt-6 max-w-2xl leading-relaxed text-pretty">{howItWorks.lede}</p>

      <ol className="mt-14 grid gap-5 lg:grid-cols-2">
        {howItWorks.steps.map((step) => (
          <li key={step.index}>
            <Card className="h-full p-8 md:p-10">
              <p className="text-fg-faint font-mono text-[13px] tracking-[0.18em]">
                {"// "}
                {step.index}
              </p>
              <h3 className="mt-6 text-[clamp(22px,2.2vw,28px)] font-semibold tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="text-fg-muted mt-3.5 leading-relaxed">{step.description}</p>
              <p className="border-line text-accent-light mt-5 border-t pt-5 text-sm font-medium">
                {step.highlight}
              </p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
