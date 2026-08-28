import { cn } from "@/lib/utils";

/** Top-up affordance next to the balance. */
export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 15 15" className={cn("size-[15px] text-white", className)}>
      <path
        d="M7.5 2.5v10M2.5 7.5h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
