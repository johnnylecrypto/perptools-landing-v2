import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionProps = React.ComponentProps<"section"> & {
  /** Anchor target for the header nav. Also labels the section for a11y. */
  id: string;
  /** Set false when the section manages its own horizontal layout. */
  contained?: boolean;
};

export function Section({ id, className, children, contained = true, ...props }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("py-section relative", className)}
      {...props}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}

/**
 * Section heading. Renders each line of `lines` on its own row; lines after the
 * first are dimmed, matching the site's two-tone headline treatment.
 */
export function SectionHeading({
  id,
  lines,
  className,
  as: Tag = "h2",
}: {
  id: string;
  lines: readonly string[];
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      id={`${id}-heading`}
      className={cn(
        "text-[clamp(32px,5vw,60px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance",
        className,
      )}
    >
      {lines.map((line, i) => (
        <span key={line} className={cn("block", i > 0 && "text-fg-subtle")}>
          {line}
        </span>
      ))}
    </Tag>
  );
}
