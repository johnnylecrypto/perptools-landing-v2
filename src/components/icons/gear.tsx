import { cn } from "@/lib/utils";

/** Settings mark on the board's chrome. */
export function GearIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className={cn("size-[18px] text-white/87", className)}>
      <circle cx="9" cy="9" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M9 1.8v1.9M9 14.3v1.9M1.8 9h1.9m10.6 0h1.9M3.9 3.9l1.3 1.3m7.6 7.6 1.3 1.3M14.1 3.9l-1.3 1.3m-7.6 7.6-1.3 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
