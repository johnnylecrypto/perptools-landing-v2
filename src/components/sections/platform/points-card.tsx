import { platform, pointsSeries } from "@/content/platform";
import { CountUp } from "@/components/ui/count-up";
import { Sparkline } from "@/components/ui/sparkline";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";

export function PointsCard() {
  const { points } = platform;

  return (
    <PlatformCard
      delay={0}
      // The row only sets a height at `lg`; on tablet the card would otherwise
      // shrink to its content and leave the sparkline — inset a fixed 72px/51px
      // — a ~45px strip with the balance sitting on top of it.
      className="flex min-h-[372px] w-full flex-col justify-between lg:flex-[534_1_0%]"
    >
      {/* Price series behind the figures. */}
      <Sparkline
        points={pointsSeries}
        marker
        className="led-spark pointer-events-none absolute top-[72px] right-5 bottom-[51px] left-5"
      />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-8">
          <CardLabel>{points.label}</CardLabel>
          <p className="flex items-baseline gap-3">
            <CountUp
              to={points.balanceValue}
              delay={320}
              duration={1500}
              className="text-[54px] leading-none font-semibold text-white tabular-nums"
            />
            <span className="text-accent/90 text-[16px] font-bold tracking-[1.05px]">
              {points.unit}
            </span>
          </p>
        </div>

        <span className="led-late bg-success/12 flex h-[22.85px] items-center gap-[5.27px] rounded-full pr-[10.54px] pl-[8.79px] shadow-[inset_0_0_0_0.88px_--alpha(var(--color-success)/30%)]">
          <span className="text-success text-[7.91px] font-bold">▲</span>
          <span className="text-success/95 text-[12px] font-medium">{points.delta}</span>
        </span>
      </div>

      <div className="led-late relative flex flex-col gap-3">
        <span className="h-px w-full bg-white/8" />
        <div className="flex justify-between text-[12px] font-bold tracking-[1.14px] uppercase">
          <span className="text-white/75">{points.rank}</span>
          <span className="text-fg-subtle/90">{points.allTime}</span>
        </div>
      </div>
    </PlatformCard>
  );
}
