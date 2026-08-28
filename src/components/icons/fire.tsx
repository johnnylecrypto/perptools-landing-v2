import { cn } from "@/lib/utils";

/** Streak stat in the HUD. */
export function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill="var(--color-fg-subtle)"
      className={cn("size-[10.5px]", className)}
    >
      <path d="M6 .8c.4 1.7-.5 2.5-1.3 3.3C3.7 5 2.8 5.9 2.8 7.5a3.2 3.2 0 0 0 6.4 0c0-1.9-1.2-3-2-3.9.2 1-.3 1.6-.8 2 .1-1.4-.2-3.4-.4-4.8Z" />
    </svg>
  );
}
