import { describe, expect, it } from "vitest";
import { pickActiveIndex } from "@/components/sections/partner-marquee/pick-active-index";

describe("pickActiveIndex", () => {
  it("picks the item nearest the container centre within the band", () => {
    expect(pickActiveIndex([10, 48, 90], 50, 10)).toBe(1);
  });

  it("returns null when nothing sits inside the band", () => {
    expect(pickActiveIndex([0, 20, 100], 50, 10)).toBeNull();
  });

  it("picks the closer of two items inside the band", () => {
    expect(pickActiveIndex([47, 54], 50, 10)).toBe(0);
  });
});
