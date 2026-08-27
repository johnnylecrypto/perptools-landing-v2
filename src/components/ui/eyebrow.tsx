import { cn } from "@/lib/utils";

/** Small uppercase mono label, e.g. `// TOTAL VOLUME`. */
export function Eyebrow({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-fg-subtle font-mono text-xs leading-none font-medium tracking-[0.18em] uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/** Pill variant with a glowing dot — used above the hero headline. */
export function EyebrowPill({ className, children, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "border-line-accent bg-accent-light/6 inline-flex h-7 items-center gap-2 rounded-full border px-3",
        "text-accent-light font-mono text-[11px] font-medium tracking-[0.18em] uppercase",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="bg-accent size-1.5 rounded-full shadow-[0_0_8px_var(--color-accent)]"
      />
      {children}
    </span>
  );
}
