import { describe, expect, it } from "vitest";
import { sheetOffset } from "@/lib/use-world-scroll";
import { SUBTICKS_PER_COLUMN, geometries } from "@/lib/prediction-engine";

const SUB = SUBTICKS_PER_COLUMN;
const WORLD = geometries.desktop.columns + 1;

/**
 * Screen position of a point fixed in the world, given the sheet is re-based
 * one column left every time the column advances.
 */
function screenX(worldColumn: number, subtick: number, progress: number) {
  const column = Math.floor(subtick / SUB);
  // Content is laid out from the current column's origin.
  const rebased = (worldColumn - column) / WORLD;
  return rebased - sheetOffset(subtick, SUB, WORLD, progress);
}

describe("sheetOffset", () => {
  it("slides exactly one column over one column of sub-ticks", () => {
    expect(sheetOffset(0, SUB, WORLD, 0)).toBe(0);
    expect(sheetOffset(SUB - 1, SUB, WORLD, 1)).toBeCloseTo(1 / WORLD, 12);
  });

  it("is continuous across a column boundary", () => {
    // The instant before the rebase and the instant after must put a fixed
    // world point at the same place on screen.
    const before = screenX(9, SUB - 1, 1);
    const after = screenX(9, SUB, 0);
    expect(after).toBeCloseTo(before, 12);
  });

  it("moves a fixed world point left at a constant rate, with no jumps", () => {
    const samples: number[] = [];
    for (let subtick = 0; subtick < SUB * 4; subtick += 1) {
      for (const progress of [0, 0.25, 0.5, 0.75]) {
        samples.push(screenX(12, subtick, progress));
      }
    }

    const deltas = samples.slice(1).map((value, i) => value - samples[i]);
    // Always leftward.
    expect(deltas.every((d) => d < 0)).toBe(true);
    // Every step the same size: no seam, no stutter at the column edges.
    const first = deltas[0];
    for (const delta of deltas) expect(delta).toBeCloseTo(first, 12);
  });

  it("clamps to one sub-tick of travel per tick", () => {
    const step = sheetOffset(0, SUB, WORLD, 1) - sheetOffset(0, SUB, WORLD, 0);
    expect(step).toBeCloseTo(1 / (WORLD * SUB), 12);
  });
});
