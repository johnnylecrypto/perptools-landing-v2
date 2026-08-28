import { cn } from "@/lib/utils";

/** Opens the how-to-play overlay. */
export function HelpIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={cn("size-[15px] text-white/87", className)}
    >
      <path d="M6.1 6a2 2 0 1 1 2.6 1.9c-.5.2-.8.6-.8 1.1v.4" />
      <circle cx="8" cy="11.8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
