import { cn } from "@/lib/utils";

/** Past-rounds mark on the board's chrome. */
export function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className={cn("size-[18px] text-white/87", className)}>
      <path
        d="M3.2 6.4A6.2 6.2 0 1 1 2.8 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M2.4 2.9v3.6H6M9 5.6V9l2.4 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
