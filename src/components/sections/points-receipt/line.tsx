import { cn } from "@/lib/utils";
import { FIRST_LINE, LINE_DELAY } from "./receipt-timing";

export /** The head reaches the first line here, then a beat per line after it. */
/** Where the total sits in the print order, so the count-up starts with it. */
/** One printed line: blank until the head passes it. */
function Line({
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
