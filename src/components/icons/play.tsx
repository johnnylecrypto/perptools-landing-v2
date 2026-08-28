import { cn } from "@/lib/utils";

/** Resume-the-playhead control. */
export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="currentColor"
      className={cn("size-[15px] text-white/87", className)}
    >
      <path d="M5.2 3.5a.6.6 0 0 1 .92-.51l6.3 4.0a.6.6 0 0 1 0 1.02l-6.3 4a.6.6 0 0 1-.92-.5V3.5Z" />
    </svg>
  );
}
