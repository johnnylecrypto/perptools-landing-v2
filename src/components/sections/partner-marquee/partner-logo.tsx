import { type Partner } from "@/content/partners";

/** One mark plus wordmark in the strip. The marquee sets `data-active` on the nearest-to-center item. */

export function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 opacity-50 data-active:opacity-100 data-active:[filter:drop-shadow(0_0_34px_--alpha(var(--color-accent)/55%))] sm:gap-4">
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
