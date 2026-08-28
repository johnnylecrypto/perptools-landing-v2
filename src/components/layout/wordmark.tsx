import Image from "next/image";

/**
 * Oversized PERPTOOLS wordmark closing the footer.
 *
 * The asset already carries the design's top-down fade baked into its alpha
 * (~10% at the cap line down to ~3% at the baseline), so it needs no extra
 * opacity or gradient mask.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/perptools.webp"
      alt=""
      width={1240}
      height={187}
      sizes="(max-width: 1240px) 100vw, 1240px"
      className={className}
    />
  );
}
