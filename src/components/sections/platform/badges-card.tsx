import Image from "next/image";
import { platform } from "@/content/platform";
import { cn } from "@/lib/utils";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";

export function BadgesCard() {
  const { badges } = platform;

  return (
    <PlatformCard delay={160} className="flex h-[181px] flex-col justify-between">
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-[24.6px]">
          <CardLabel className="flex-1">{badges.label}</CardLabel>
          <p className="text-[12px] font-bold tracking-[0.35px]">
            <span className="text-white">{badges.earned}</span>
            <span className="text-white/60"> / {badges.total}</span>
          </p>
        </div>

        <ul className="flex w-full items-center justify-between">
          {badges.items.map((badge, index) => (
            <li
              key={index}
              className="led-tile shrink-0"
              style={{ "--i": index } as React.CSSProperties}
            >
              {badge ? (
                <Image
                  src={badge}
                  alt=""
                  width={48}
                  height={48}
                  sizes="48px"
                  className={cn(
                    "size-12 object-cover",
                    // Locked badges stay visible but muted, matching "2 / 12".
                    index >= badges.earned && "opacity-35 grayscale",
                  )}
                />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "block size-12 rounded-xl",
                    index < badges.earned
                      ? "bg-accent/12 shadow-[inset_0_0_0_1px_--alpha(var(--color-accent)/35%)]"
                      : "bg-white/4 shadow-[inset_0_0_0_1px_--alpha(var(--color-white)/8%)]",
                  )}
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] font-medium text-white/40">{badges.latest}</p>
    </PlatformCard>
  );
}
