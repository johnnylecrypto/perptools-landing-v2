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

export const footerNav: readonly NavItem[] = [
  { label: "Platform", href: "/#platform" },
  { label: "Arena", href: "/#arena" },
  { label: "Security", href: "/#security" },
  { label: "MCP Doc", href: site.links.mcpDocs, external: true },
];
