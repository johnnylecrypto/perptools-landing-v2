import { partners, type Partner } from "@/content/partners";
import { cn } from "@/lib/utils";

/**
 * Infinite partner strip: the list is rendered twice and translated -50%, so
 * the seam lands exactly on the duplicate. Pauses under reduced motion (the
 * global media query kills the animation).
 */
export function PartnerMarquee({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-24 overflow-hidden", className)} aria-label="Backed by">
      <div className="animate-marquee flex h-full w-max items-center gap-24 pl-0">
        {[...partners, ...partners].map((partner, index) => (
          <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
        ))}
      </div>

      {/* Edge fades so items dissolve instead of clipping. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-60 bg-[linear-gradient(270deg,transparent_0%,rgb(3_5_7/0.85)_55%,#030507_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-60 bg-[linear-gradient(90deg,transparent_0%,rgb(3_5_7/0.85)_55%,#030507_100%)]" />
    </div>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-4",
        // drop-shadow hugs the mark and lettering; the design file's box-shadow
        // would draw a rectangular halo around the whole row.
        partner.featured
          ? "opacity-100 [filter:drop-shadow(0_0_34px_rgb(50_186_244/0.55))]"
          : "opacity-50",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center opacity-80">
        {partner.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- partner marks are pre-sized SVG/PNG
          <img
            src={partner.logo}
            alt=""
            width={48}
            height={48}
            className="size-12 object-contain"
          />
        ) : (
          <span className="border-line-strong flex size-12 items-center justify-center rounded-lg border bg-white/5 font-semibold text-white">
            {partner.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="text-2xl font-semibold whitespace-nowrap text-white opacity-80">
        {partner.name}
      </span>
    </div>
  );
}
