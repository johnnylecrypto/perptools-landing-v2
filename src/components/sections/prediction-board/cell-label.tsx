import { cn } from "@/lib/utils";

export function CellLabel({
  font,
  className,
  children,
}: {
  font: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{ fontSize: font }}
      className={cn(
        "absolute inset-0 flex items-center justify-center leading-none font-semibold tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}
