import { cn } from "@/lib/utils";

/** Halt-the-playhead control. */
export function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn("size-[15px] text-white/87", className)}
    >
      <rect x="4.4" y="3.4" width="2.5" height="9.2" rx="0.7" />
      <rect x="9.1" y="3.4" width="2.5" height="9.2" rx="0.7" />
    </svg>
  );
}
