import { site } from "@/lib/site";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

/**
 * Primary nav (per the v2 header design). In-page items must match a section
 * `id` on the home page; product destinations point at the app.
 */
export const primaryNav: readonly NavItem[] = [
  { label: "Terminal", href: site.links.terminal, external: true },
  { label: "Points", href: site.links.points, external: true },
  { label: "Tap Predictions", href: site.links.tapPredictions, external: true },
  { label: "MCP Doc", href: site.links.mcpDocs, external: true },
];

/**
 * Mobile sheet nav. Its own list rather than `primaryNav`: the design spells
 * "Points" out as "Points Program" and adds a Security entry, which the
 * desktop bar has no room for.
 */
export const mobileNav: readonly NavItem[] = [
  { label: "Terminal", href: site.links.terminal, external: true },
  { label: "Points Program", href: site.links.points, external: true },
  { label: "Tap Predictions", href: site.links.tapPredictions, external: true },
  { label: "MCP Doc", href: site.links.mcpDocs, external: true },
  { label: "Security", href: site.links.security, external: true },
];

export type NavGroup = {
  title: string;
  items: readonly NavItem[];
};

export const footerGroups: readonly NavGroup[] = [
  {
    title: "Trade",
    items: [
      { label: "Spot", href: site.links.spot, external: true },
      { label: "Perpetuals", href: site.links.terminal, external: true },
    ],
  },
  {
    title: "Earn & play",
    items: [
      { label: "Points Program", href: site.links.points, external: true },
      { label: "Tap Predictions", href: site.links.tapPredictions, external: true },
    ],
  },
  {
    title: "Build",
    items: [
      { label: "MCP Doc", href: site.links.mcpDocs, external: true },
      { label: "Security", href: site.links.security, external: true },
    ],
  },
];
