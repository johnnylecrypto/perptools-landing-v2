import { cn } from "@/lib/utils";

/** Small uppercase card label. */
export function CardLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-fg-subtle/95 text-[12px] font-bold tracking-[1.49px] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
