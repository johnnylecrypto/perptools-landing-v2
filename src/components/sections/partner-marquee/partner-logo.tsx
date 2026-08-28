import { type Partner } from "@/content/partners";
import { cn } from "@/lib/utils";

/** One mark plus wordmark in the strip; featured partners keep full opacity. */

export function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-2.5 sm:gap-4",
        // drop-shadow hugs the mark and lettering; the design file's box-shadow
        // would draw a rectangular halo around the whole row.
        partner.featured
          ? "opacity-100 [filter:drop-shadow(0_0_34px_rgb(50_186_244/0.55))]"
          : "opacity-50",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center opacity-80 sm:size-12">
        {partner.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- partner marks are pre-sized SVG/PNG
          <img
            src={partner.logo}
            alt=""
            width={48}
            height={48}
            className="size-8 object-contain sm:size-12"
          />
        ) : (
          <span className="border-line-strong flex size-8 items-center justify-center rounded-lg border bg-white/5 font-semibold text-white sm:size-12">
            {partner.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="text-base font-semibold whitespace-nowrap text-white opacity-80 sm:text-2xl">
        {partner.name}
      </span>
    </div>
  );
}
