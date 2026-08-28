import { cn } from "@/lib/utils";
import { timeLabel, type Geometry } from "@/lib/prediction-engine";

/**
 * Seconds row above the grid.
 *
 * One label per column, so each is exactly a cell wide and the two stay in step
 * however the board is sized. The design file dims and lightens the interior
 * ticks and keeps the outermost ones semibold, which is what stops the row
 * reading as a wall of numbers.
 */
export function TimeAxis({ geometry, font }: { geometry: Geometry; font: number }) {
  const total = geometry.columns + 1;
  return (
    <div aria-hidden className="flex bg-[#010101]" style={{ height: geometry.strip }}>
      {Array.from({ length: total }, (_, column) => {
        const offset = column - (geometry.nowColumn - 1);
        const edge = column === 0 || column >= total - 7;
        return (
          <span
            key={column}
            style={{ fontSize: font - 1.5, lineHeight: edge ? "13.5px" : "12px" }}
            className={cn(
              "flex flex-1 items-center justify-center tabular-nums",
              edge ? "font-semibold text-white/36" : "font-normal text-white/40",
            )}
          >
            {offset === 0 ? "" : timeLabel(offset)}
          </span>
        );
      })}
    </div>
  );
}
