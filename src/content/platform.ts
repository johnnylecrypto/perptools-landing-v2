export type Feature = {
  title: string;
  description: string;
};

export const platform = {
  eyebrow: "The Platform",
  heading: ["Perps,", "refined."] as const,
  subheading: ["Speed of a CEX.", "Custody of a DEX."] as const,
  features: [
    {
      title: "CEX-level performance",
      description: "Low-latency, high-throughput matching. Built for HFT and pro strategies.",
    },
    {
      title: "Full order suite",
      description:
        "Limit, Market, TP/SL, Post-only, IOC, FOK, Reduce-only. Everything you'd expect. Nothing you'd miss.",
    },
    {
      title: "Omnichain liquidity",
      description: "One orderbook. Multiple chains. Tight spreads, minimal slippage.",
    },
    {
      title: "Hands-on or hands-off",
      description: "Trade from your wallet. Or delegate to an agent vault. Always your call.",
    },
  ] satisfies Feature[],
} as const;
