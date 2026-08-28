import { cn } from "@/lib/utils";

/** Balance pill mark on the phone footer. */
export function WalletIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 22 22" className={cn("size-[22px] text-white", className)}>
      <path
        d="M3.5 6.5h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Zm0 0V5a1 1 0 0 1 1-1h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="12.5" r="1.15" fill="currentColor" />
    </svg>
  );
}
