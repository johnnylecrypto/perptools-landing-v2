import { cn } from "@/lib/utils";

export function PlatformCard({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      className={cn(
        "led-card bg-board-bg/30 relative overflow-hidden rounded-2xl p-5",
        "shadow-[inset_0_0_0_1px_--alpha(var(--color-white)/15%)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
