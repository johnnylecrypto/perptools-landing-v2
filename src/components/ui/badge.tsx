import { cn } from "@/lib/utils";

/** Compact accented tag used for security proof points. */
export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "border-line-accent bg-accent-light/6 inline-flex items-center rounded-full border px-3 py-1",
        "text-accent-light font-mono text-[11px] tracking-[0.14em] uppercase",
        className,
      )}
      {...props}
    />
  );
}
