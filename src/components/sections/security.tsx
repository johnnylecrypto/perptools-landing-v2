import { security } from "@/content/security";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";

export function Security() {
  return (
    <Section id="security">
      <Eyebrow>{security.eyebrow}</Eyebrow>
      <SectionHeading id="security" lines={security.heading} className="mt-6" />
      <p className="text-fg-muted mt-6 max-w-3xl leading-relaxed text-pretty">{security.lede}</p>

      <ul className="mt-14 grid gap-5 lg:grid-cols-3">
        {security.pillars.map((pillar) => (
          <li key={pillar.title}>
            <Card className="flex h-full flex-col p-8">
              <h3 className="text-xl font-semibold tracking-[-0.01em]">{pillar.title}</h3>
              <p className="text-fg-muted mt-3 flex-1 text-sm leading-relaxed">
                {pillar.description}
              </p>
              <Badge className="mt-6 self-start">{pillar.badge}</Badge>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
