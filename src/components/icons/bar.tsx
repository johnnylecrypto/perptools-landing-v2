import { cn } from "@/lib/utils";

/** PnL stat in the HUD; red when the run is under water, green otherwise. */
export function BarIcon({ negative, className }: { negative: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill={negative ? "#FF7578" : "#3FD08B"}
      className={cn("size-[10.5px]", className)}
    >
      <rect x="1.4" y="6.4" width="2.4" height="4" rx="0.4" />
      <rect x="4.8" y="3.6" width="2.4" height="6.8" rx="0.4" />
      <rect x="8.2" y="1.6" width="2.4" height="8.8" rx="0.4" />
    </svg>
  );
}
