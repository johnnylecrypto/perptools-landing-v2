import { Hero } from "@/components/sections/hero";
import { Live } from "@/components/sections/live";
import { Platform } from "@/components/sections/platform";
import { Points } from "@/components/sections/points";
import { ClosingCta } from "@/components/sections/closing-cta";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Live />
      <Platform />
      <Points />
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
