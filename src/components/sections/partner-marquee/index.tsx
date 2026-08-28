import { partners } from "@/content/partners";
import { cn } from "@/lib/utils";
import { PartnerLogo } from "./partner-logo";

/**
 * Infinite partner strip: the list is rendered twice and translated -50%, so
 * the seam lands exactly on the duplicate. Pauses under reduced motion (the
 * global media query kills the animation).
 */
export function PartnerMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-20 overflow-hidden sm:h-24", className)} aria-label="Backed by">
      <div className="animate-marquee flex h-full w-max items-center gap-4 pl-0 sm:gap-24">
        {[...partners, ...partners].map((partner, index) => (
          <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
        ))}
      </div>

      {/* Edge fades so items dissolve instead of clipping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(270deg,transparent_0%,--alpha(var(--color-bg-0)/85%)_55%,var(--color-bg-0)_100%)] sm:w-40 lg:w-60" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(90deg,transparent_0%,--alpha(var(--color-bg-0)/85%)_55%,var(--color-bg-0)_100%)] sm:w-40 lg:w-60" />
    </div>
  );
}
