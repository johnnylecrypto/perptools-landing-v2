import { cn } from "@/lib/utils";

/** Tap-count stat in the HUD. Grey is fixed: the HUD stats read as one row. */
export function TapIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill="none"
      stroke="var(--color-fg-subtle)"
      strokeWidth="1"
      className={cn("size-[10.5px]", className)}
    >
      <path d="M4.6 6V2.4a1 1 0 0 1 2 0V6m0 0V4.9a.9.9 0 0 1 1.8 0V6m0 0a.9.9 0 0 1 1.8 0v2.1a2.4 2.4 0 0 1-2.4 2.4H6.1a2.4 2.4 0 0 1-2.1-1.2L2.6 7" />
    </svg>
  );
}
