import { Hero } from "@/components/sections/hero";
import { Live } from "@/components/sections/live";
import { Platform } from "@/components/sections/platform";
import { Points } from "@/components/sections/points";
import { ClosingCta } from "@/components/sections/closing-cta";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* Sections are spaced from here rather than from their own padding, so
          the number in the design is the number between two sections — two
          paddings would stack to twice it. 64px on phones, 128px from `sm`. */}
      <div className="flex flex-col gap-16 pb-16 sm:gap-32 sm:pb-32">
        <Hero />
        <Live />
        <Platform />
        <Points />
        <ClosingCta />
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
            sameAs: [site.links.x],
          }),
        }}
      />
    </>
  );
}
