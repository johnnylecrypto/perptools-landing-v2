import { cn } from "@/lib/utils";

/**
 * Surface card: layered gradient background, hairline border, and an accent
 * wash that strengthens on hover.
 */
export function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group border-line-strong relative isolate overflow-hidden rounded-2xl border",
        "bg-[linear-gradient(180deg,var(--color-bg-3),var(--color-bg-1))]",
        "hover:border-line-accent shadow-[var(--shadow-card)] transition-colors duration-300",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-[linear-gradient(180deg,transparent_55%,rgb(43_185_243/0.06))]",
          "group-hover:opacity-100",
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
