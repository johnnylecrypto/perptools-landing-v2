import { site } from "@/lib/site";

export const hero = {
  heading: ["A smarter way", "to trade crypto."] as const,
  lede: "Trade perpetuals, earn Points through your activity, and use them to predict what the market does next.",
  primaryCta: { label: "Launch App", href: site.links.app },
  secondaryCta: { label: "Explore Points", href: site.links.points },
} as const;

export const closingCta = {
  heading: "The market is moving.",
  lede: "Trade perpetuals, earn Points from every fill, then put them to work on the prediction board.",
  cta: { label: "Launch App", href: site.links.app },
} as const;
