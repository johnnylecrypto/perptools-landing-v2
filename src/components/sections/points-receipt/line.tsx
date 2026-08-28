import { cn } from "@/lib/utils";
import { FIRST_LINE, LINE_DELAY } from "./receipt-timing";

export function Line({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("receipt-line w-full", className)}
      style={{ animationDelay: `${FIRST_LINE + index * LINE_DELAY}s` }}
    >
      {children}
    </div>
  );
}
