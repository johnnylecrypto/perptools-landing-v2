/**
 * Single source of truth for site-wide identity: URLs, copy defaults and
 * external destinations. Anything rendered in more than one place lives here.
 */
const APP_ORIGIN = "https://app.perptools.ai";
const LANDING_UTM = "utm_source=newlanding&utm_medium=newlandingpage&utm_campaign=none";

export const site = {
  name: "PERPTools",
  title: "PERPTools — The Market Never Sleeps",
  description:
    "Trade smarter with autonomous agents, real on-chain transparency, and CEX-grade performance — without giving up control.",
  /** Footer blurb. */
  blurb:
    "PERPTools is shaping a free and open ecosystem for all users to grow their wealth in a safe and trusted environment.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://perptools.ai",
  themeColor: "#030507",
  noindex: process.env.NEXT_PUBLIC_NOINDEX === "true",
  logo: "/brand/logo-mark.webp",
  locale: "en_US",
  twitter: "@perptools",
  links: {
    /** Header, hero, and footer launch CTAs — matches prod landing attribution. */
    app: `${APP_ORIGIN}/?${LANDING_UTM}`,
    /** Mobile drawer launch CTA — prod omits UTM on this entry point. */
    appPlain: `${APP_ORIGIN}/`,
    terminal: `${APP_ORIGIN}/perp`,
    spot: `${APP_ORIGIN}/spot`,
    points: `${APP_ORIGIN}/rewards/points`,
    tapPredictions: `${APP_ORIGIN}/prediction`,
    arena: `${APP_ORIGIN}/ai-arena`,
    mcpDocs: "https://mcp.perptools.ai/",
    security: "https://docs.perptools.ai/docs",
    discord: "https://discord.gg/perptools",
    x: "https://x.com/perptools",
    telegram: "https://t.me/perptools",
    orderly: "https://orderly.network",
  },
} as const;

export type Site = typeof site;
