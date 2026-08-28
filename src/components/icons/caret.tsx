import { cn } from "@/lib/utils";

/** Disclosure caret; flips when `open`. */
export function CaretIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn("size-3 text-white/70 transition-transform", open && "rotate-180", className)}
    >
      <path
        d="M3 4.75 6 7.75l3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
