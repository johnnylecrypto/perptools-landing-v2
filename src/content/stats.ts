export type Stat = {
  label: string;
  value: number;
  /** Rendered before the animated value, e.g. `$`. */
  prefix?: string;
  /** Rendered after the animated value, e.g. `M+`, `%`, `MS`. */
  suffix?: string;
  decimals?: number;
};

export const stats = {
  eyebrow: "By The Numbers",
  heading: ["Agents don't sleep.", "The numbers prove it."] as const,
  lede: "Strategies run 24/7, markets don't wait. Here's what PERPTools agents have been doing.",
  items: [
    { label: "Total Volume", value: 412, prefix: "$", suffix: "M+" },
    { label: "Profits Realized", value: 875, prefix: "$", suffix: "K+" },
    { label: "Win Rate", value: 68.4, suffix: "%", decimals: 1 },
    { label: "Median Latency", value: 8, suffix: "MS" },
  ] satisfies Stat[],
} as const;
