import { cn } from "@/lib/utils";

/**
 * Completed-task tick on the points dashboard.
 *
 * `led-tick` is the stroke-dash draw-on; it belongs to the entrance cascade,
 * so it stays baked in rather than being passed by every caller.
 */
export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--color-success)"
      strokeWidth="1.76"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path className="led-tick" d="m2.3 8.6 4 4 7.4-9" />
    </svg>
  );
}
