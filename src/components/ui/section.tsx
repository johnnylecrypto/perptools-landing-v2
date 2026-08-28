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
      className={cn("relative", className)}
      {...props}
    >
      {contained ? <Container>{children}</Container> : children}
    </section>
  );
}
