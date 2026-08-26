export type SecurityPillar = {
  title: string;
  /** Body copy; `strong` fragments are wrapped by the section component. */
  description: string;
  badge: string;
};

export const security = {
  eyebrow: "Security",
  heading: ["We never hold your funds.", "Ever."] as const,
  lede: "Execution runs on Orderly Network — the omnichain, non-custodial infrastructure powering $188B+ in cumulative perpetuals volume. Your keys, your coins, your trades.",
  pillars: [
    {
      title: "Your keys. Your coins. On-chain.",
      description:
        "PERPTools never holds your funds. Assets settle through Orderly's on-chain vault — you keep custody, you sign each grant, and you revoke access in one transaction. No intermediary stands between you and your position.",
      badge: "Self-custodial",
    },
    {
      title: "One orderbook. Every chain.",
      description:
        "Live across every major chain through Orderly's shared liquidity — every fill, fee, and position clears through one unified book on-chain. Fake performance is mathematically impossible.",
      badge: "$188B+ Cumulative Volume",
    },
    {
      title: "Audited. Battle-tested. Public.",
      description:
        "Orderly's contracts have passed multiple independent audits and already power trading for 1M+ users across the ecosystem. Every report is open. The protocol is the only counterparty.",
      badge: "Multiple Audits · 1M+ Users",
    },
  ] satisfies SecurityPillar[],
} as const;
