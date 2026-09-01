import { Hero } from "@/components/sections/hero";
import { Live } from "@/components/sections/live";
import { Platform } from "@/components/sections/platform";
import { Points } from "@/components/sections/points";
import { ClosingCta } from "@/components/sections/closing-cta";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <div className="flex flex-col gap-16 pb-16 sm:gap-24 sm:pb-24 lg:gap-32 lg:pb-32">
        <Hero />
        <div className="below-fold-paint">
          <Live />
        </div>
        <div className="below-fold-paint">
          <Platform />
        </div>
        <div className="below-fold-paint">
          <Points />
        </div>
        <div className="below-fold-paint">
          <ClosingCta />
        </div>
      </div>
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
            logo: new URL(site.logo, site.url).toString(),
            sameAs: [site.links.x, site.links.telegram, site.links.discord],
          }),
        }}
      />
    </>
  );
}
