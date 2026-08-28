import { cn } from "@/lib/utils";

/** Restart-the-run control. */
export function ResetIcon({ className }: { className?: string }) {
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
      <path d="M13.4 8a5.4 5.4 0 1 1-1.6-3.8" />
      <path d="M12.6 2.2v2.9H9.7" />
    </svg>
  );
}
