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
