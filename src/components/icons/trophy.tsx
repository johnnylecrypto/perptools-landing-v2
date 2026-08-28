import { cn } from "@/lib/utils";

/** Leaderboard mark. Gold is part of the mark's identity on this board. */
export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 18 18" className={cn("text-warning size-[18px]", className)}>
      <path
        d="M5 3h8v4a4 4 0 0 1-8 0V3Zm0 1.5H3.2A2.8 2.8 0 0 0 6 8m7-3.5h1.8A2.8 2.8 0 0 1 12 8M9 11v3m-2.5 1.5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
