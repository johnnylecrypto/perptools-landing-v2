import { site } from "@/lib/site";

export const hero = {
  heading: ["A smarter way", "to trade crypto."] as const,
  lede: "Trade perpetuals, earn Points through your activity, and use them to predict what the market does next.",
  primaryCta: { label: "Launch App", href: site.links.app },
  secondaryCta: { label: "Explore Points", href: site.links.points },
} as const;

export const closingCta = {
  eyebrow: "The Platform",
  heading: ["Built for traders.", "By traders."] as const,
  lede: "PERPTools redefines perpetual trading with AI-powered automation, transparent execution, and a frictionless on-chain experience — all in one platform.",
} as const;
