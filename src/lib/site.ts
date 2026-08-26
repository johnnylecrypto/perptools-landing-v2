/**
 * Single source of truth for site-wide identity: URLs, copy defaults and
 * external destinations. Anything rendered in more than one place lives here.
 */
export const site = {
  name: "PERPTools",
  title: "PERPTools — The Market Never Sleeps",
  description:
    "Trade smarter with autonomous agents, real on-chain transparency, and CEX-grade performance — without giving up control.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://perptools.ai",
  locale: "en_US",
  twitter: "@perptools",
  links: {
    app: "https://app.perptools.ai",
    terminal: "https://app.perptools.ai/terminal",
    points: "https://app.perptools.ai/points",
    tapPredictions: "https://app.perptools.ai/tap-predictions",
    arena: "/#arena",
    mcpDocs: "https://docs.perptools.ai/mcp",
    x: "https://x.com/perptools",
    orderly: "https://orderly.network",
  },
} as const;

export type Site = typeof site;
