import { platform } from "@/content/platform";
import { CountUp } from "@/components/ui/count-up";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";
import { Progress } from "./progress";

export function RewardPoolCard() {
  const { rewardPool } = platform;

  return (
    <PlatformCard delay={240} className="flex flex-1 flex-col justify-between">
      <CardLabel>{rewardPool.label}</CardLabel>

      <div className="flex flex-col gap-4">
        <p className="flex items-baseline gap-2">
          <CountUp
            to={rewardPool.amountValue}
            delay={560}
            duration={1700}
            className="text-[26px] leading-none font-semibold text-white tabular-nums"
          />
          <span className="text-accent/90 text-[10px] font-bold tracking-[1.05px]">
            {rewardPool.unit}
          </span>
        </p>

        <div className="flex flex-col gap-[8.2px]">
          <Progress value={rewardPool.progress} color="var(--color-accent)" />
          <div className="flex items-center justify-between text-[12px] font-medium">
            <span className="text-fg-subtle/90">{rewardPool.countdownLabel}</span>
            <span className="text-white/85">{rewardPool.countdown}</span>
          </div>
        </div>
      </div>
    </PlatformCard>
  );
}
