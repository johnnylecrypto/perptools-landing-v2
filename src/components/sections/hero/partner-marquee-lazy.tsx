"use client";

import dynamic from "next/dynamic";

const PartnerMarquee = dynamic(
  () => import("@/components/sections/partner-marquee").then((module) => module.PartnerMarquee),
  { ssr: false, loading: () => <div className="h-12 w-full shrink-0" aria-hidden /> },
);

export function PartnerMarqueeLazy({ className }: { className?: string }) {
  return <PartnerMarquee className={className} />;
}
