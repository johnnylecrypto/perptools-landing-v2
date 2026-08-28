import { cn } from "@/lib/utils";

export /**
 * Shared card shell: translucent ink, hairline ring, 20px padding.
 *
 * `delay` is the card's place in the entrance cascade, in milliseconds.
 */
function PlatformCard({
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
        "led-card relative overflow-hidden rounded-2xl bg-[rgb(1_1_1/0.3)] p-5",
        "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
