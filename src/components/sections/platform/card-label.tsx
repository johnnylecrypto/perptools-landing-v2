import { cn } from "@/lib/utils";

export /** Small uppercase card label. */
function CardLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[12px] font-bold tracking-[1.49px] text-[rgb(129_134_137/0.95)] uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
