import { cn } from "@/lib/utils";

/**
 * Drag handle. A 2x3 dot grid rather than an SVG — the dots inherit the
 * surrounding rounding and spacing tokens this way.
 */
export function GripIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-[18px] grid-cols-2 place-content-center gap-x-[4.1px] gap-y-[2.7px] rounded-[3px]",
        className,
      )}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="size-[2.64px] rounded-[0.5px] bg-white/60" />
      ))}
    </span>
  );
}
