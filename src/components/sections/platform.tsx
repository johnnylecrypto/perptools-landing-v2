import { platform } from "@/content/platform";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";

export function Platform() {
  return (
    <Section id="platform">
      <Eyebrow>{platform.eyebrow}</Eyebrow>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-end">
        <SectionHeading id="platform" lines={platform.heading} />
        <p className="text-fg-subtle font-mono text-sm tracking-[0.14em] uppercase lg:text-right">
          {platform.subheading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2">
        {platform.features.map((feature) => (
          <li key={feature.title}>
            <Card className="h-full p-8">
              <h3 className="text-xl font-semibold tracking-[-0.01em]">{feature.title}</h3>
              <p className="text-fg-muted mt-3 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
