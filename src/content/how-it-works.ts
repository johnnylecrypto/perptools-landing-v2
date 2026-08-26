export type Step = {
  /** Rendered as `// 01` — kept as a string so leading zeros survive. */
  index: string;
  title: string;
  description: string;
  /** Emphasised closing line under the description. */
  highlight: string;
};

export const howItWorks = {
  eyebrow: "How It Works",
  heading: ["Agents execute your", "rules.", "No magic."] as const,
  lede: "Your rules, defined once — running without you. The same cycle, every trade, every hour, every day.",
  steps: [
    {
      index: "01",
      title: "Signal Detection",
      description:
        "The agent reads every market — price, depth, funding, on-chain flow — across every timeframe, simultaneously.",
      highlight: "You'd need 12 screens. It needs none.",
    },
    {
      index: "02",
      title: "Risk Assessment",
      description:
        "Before any entry, it calculates the worst case — position size, margin, expected drawdown — against your limits.",
      highlight: "If the math doesn't work, the trade doesn't happen.",
    },
    {
      index: "03",
      title: "Order Execution",
      description: "By the time a human hits Confirm, the position is already open.",
      highlight: "Orders on-chain in under 8ms — before the price moves against you.",
    },
    {
      index: "04",
      title: "Position Management",
      description:
        "The agent monitors, adjusts risk, scales positions, and exits with precision — 24/7, without hesitation.",
      highlight: "Always in control. Never idle.",
    },
  ] satisfies Step[],
} as const;
