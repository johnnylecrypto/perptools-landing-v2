import { cn } from "@/lib/utils";

/** Dismiss mark on the mobile menu toggle. Not the X brand mark — see icons/x. */
export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("size-5", className)}
    >
      <path d="M4 4 16 16M16 4 4 16" />
    </svg>
  );
}
