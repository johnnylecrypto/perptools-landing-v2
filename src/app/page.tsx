import { Hero } from "@/components/sections/hero";
import { Platform } from "@/components/sections/platform";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Stats } from "@/components/sections/stats";
import { Arena } from "@/components/sections/arena";
import { Security } from "@/components/sections/security";
import { ClosingCta } from "@/components/sections/closing-cta";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Platform />
      <HowItWorks />
      <Stats />
      <Arena />
      <Security />
      <ClosingCta />
      <script
        type="application/ld+json"
        // Structured data for rich results; content is fully static.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            description: site.description,
            sameAs: [site.links.x],
          }),
        }}
      />
    </>
  );
}
