import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { primaryNav, footerGroups } from "@/content/navigation";

/**
 * Every in-page nav link must resolve to a section rendered on the home page,
 * otherwise the anchor silently does nothing.
 */
const homePageSource = readFileSync(resolve(process.cwd(), "src/app/page.tsx"), "utf8");
const sectionIds = [
  "hero",
  "platform",
  "how-it-works",
  "stats",
  "arena",
  "security",
  "get-started",
];

describe("navigation", () => {
  it("home page renders every known section component", () => {
    expect(homePageSource).toContain("<Hero />");
    expect(homePageSource).toContain("<Points />");
  });

  const allLinks = [...primaryNav, ...footerGroups.flatMap((group) => group.items)];

  it.each(allLinks)("$label points somewhere real", (item) => {
    if (item.external) {
      expect(item.href).toMatch(/^https?:\/\//);
      return;
    }
    const anchor = item.href.split("#")[1];
    expect(sectionIds).toContain(anchor);
  });
});
