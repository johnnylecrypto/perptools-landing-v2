import Image from "next/image";
import { platform, pointsSeries } from "@/content/platform";
import { Sparkline } from "@/components/ui/sparkline";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

/**
 * Points dashboard: balance, rank, badges, reward pool, weekly tasks and the
 * live activity feed, laid out on the design file's 1080px grid.
 */
export function Platform() {
  return (
    <section id="platform" aria-labelledby="platform-heading" className="py-section">
      {/* `Reveal` only carries the scroll trigger; everything inside it stays
          server-rendered. The staging is CSS, keyed off the class it adds. */}
      <Reveal className="ledger frame w-full">
        <div className="flex w-full flex-col items-center gap-16">
          <header className="led-head flex flex-col items-center gap-[18.89px] text-center">
            <h2
              id="platform-heading"
              className="max-w-[874.88px] text-[clamp(30px,5vw,48px)] leading-[1.05] font-medium text-balance text-white mix-blend-lighten"
            >
              {platform.heading}
            </h2>
            <p className="max-w-[636.28px] text-[16px] leading-[23.86px] text-pretty text-[#7A8494]">
              {platform.lede}
            </p>
          </header>

          {/* Cards share the row by design ratio rather than fixed px: the
              section fills its padded width now, and fixed widths would leave
              the rows short of the right edge past a 1080px frame. */}
          <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-4 lg:h-[372px] lg:flex-row">
              <PointsCard />
              <RankCard />
              <div className="flex flex-col gap-4 lg:flex-[257_1_0%]">
                <BadgesCard />
                <RewardPoolCard />
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:h-[188px] lg:flex-row">
              <TasksCard />
              <ActivityCard />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/**
 * Shared card shell: translucent ink, hairline ring, 20px padding.
 *
 * `delay` is the card's place in the entrance cascade, in milliseconds.
 */
function Card({
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

/** Small uppercase card label. */
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

/** Two-tone progress rail. */
function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-[3px] w-full rounded-[2px] bg-white/10">
      {/* Scaled rather than sized, so the fill animation runs on the compositor. */}
      <div
        className="led-fill h-full rounded-[2px]"
        style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%`, background: color }}
      />
    </div>
  );
}

function PointsCard() {
  const { points } = platform;

  return (
    <Card delay={0} className="flex w-full flex-col justify-between lg:flex-[534_1_0%]">
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
            <span className="text-[16px] font-bold tracking-[1.05px] text-[rgb(43_185_243/0.9)]">
              {points.unit}
            </span>
          </p>
        </div>

        <span className="led-late flex h-[22.85px] items-center gap-[5.27px] rounded-full bg-[rgb(63_208_139/0.12)] pr-[10.54px] pl-[8.79px] shadow-[inset_0_0_0_0.88px_rgb(63_208_139/0.3)]">
          <span className="text-[7.91px] font-bold text-[#3FD08B]">▲</span>
          <span className="text-[12px] font-medium text-[rgb(63_208_139/0.95)]">
            {points.delta}
          </span>
        </span>
      </div>

      <div className="led-late relative flex flex-col gap-3">
        <span className="h-px w-full bg-white/8" />
        <div className="flex justify-between text-[12px] font-bold tracking-[1.14px] uppercase">
          <span className="text-white/75">{points.rank}</span>
          <span className="text-[rgb(129_134_137/0.9)]">{points.allTime}</span>
        </div>
      </div>
    </Card>
  );
}

function RankCard() {
  const { rank } = platform;

  return (
    <Card delay={80} className="flex flex-col gap-4 lg:flex-[257_1_0%]">
      <div className="flex flex-col items-center gap-[17px]">
        <CardLabel className="self-stretch">{rank.label}</CardLabel>
        {rank.badge ? (
          <Image
            src={rank.badge}
            alt=""
            width={138}
            height={127}
            className="led-badge h-[127px] w-[138px] object-contain drop-shadow-[0_0_34px_rgb(63_208_139/0.4)]"
          />
        ) : (
          <span
            aria-hidden
            className="led-badge flex h-[127px] w-[138px] items-center justify-center rounded-2xl bg-[#3FD08B]/8 text-[13px] font-semibold tracking-[0.16em] text-[#3FD08B]/70 shadow-[0_0_34px_rgb(63_208_139/0.25),inset_0_0_0_1px_rgb(63_208_139/0.25)]"
          >
            {rank.tier}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-[16.4px]">
        <div className="flex flex-col gap-[4.1px] text-center">
          <p className="text-[26px] leading-none font-semibold text-white">{rank.tier}</p>
          <p className="text-[10px] font-medium tracking-[1.41px] text-[rgb(129_134_137/0.95)] uppercase">
            {rank.tierPosition}
          </p>
        </div>

        <div className="flex flex-col gap-[8.2px]">
          <Progress value={rank.progress} color="#3FD08B" />
          <div className="flex justify-between text-[12px] font-medium tracking-[1.05px]">
            <span className="text-[rgb(63_208_139/0.95)]">{rank.tier}</span>
            <span className="text-[rgb(43_185_243/0.8)]">{rank.nextTier}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <p className="text-[12px] font-bold text-white/80">{rank.toNext}</p>
        <ul className="flex items-center justify-between">
          {rank.tiers.map((tier, index) => (
            <li key={tier.name} className="led-pip" style={{ "--i": index } as React.CSSProperties}>
              <TierPip color={tier.color} reached={index < rank.current} label={tier.name} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function BadgesCard() {
  const { badges } = platform;

  return (
    <Card delay={160} className="flex h-[181px] flex-col justify-between">
      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-[24.6px]">
          <CardLabel className="flex-1">{badges.label}</CardLabel>
          <p className="text-[12px] font-bold tracking-[0.35px]">
            <span className="text-white">{badges.earned}</span>
            <span className="text-white/60"> / {badges.total}</span>
          </p>
        </div>

        <ul className="flex items-center gap-2">
          {badges.items.map((badge, index) => (
            <li key={index} className="led-tile" style={{ "--i": index } as React.CSSProperties}>
              {badge ? (
                <Image
                  src={badge}
                  alt=""
                  width={48}
                  height={48}
                  className={cn(
                    "size-12",
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
                      ? "bg-[#2BB9F3]/12 shadow-[inset_0_0_0_1px_rgb(43_185_243/0.35)]"
                      : "bg-white/4 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]",
                  )}
                />
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] font-medium text-white/40">{badges.latest}</p>
    </Card>
  );
}

function RewardPoolCard() {
  const { rewardPool } = platform;

  return (
    <Card delay={240} className="flex flex-1 flex-col justify-between">
      <CardLabel>{rewardPool.label}</CardLabel>

      <div className="flex flex-col gap-4">
        <p className="flex items-baseline gap-2">
          <CountUp
            to={rewardPool.amountValue}
            delay={560}
            duration={1700}
            className="text-[26px] leading-none font-semibold text-white tabular-nums"
          />
          <span className="text-[10px] font-bold tracking-[1.05px] text-[rgb(43_185_243/0.9)]">
            {rewardPool.unit}
          </span>
        </p>

        <div className="flex flex-col gap-[8.2px]">
          <Progress value={rewardPool.progress} color="#2BB9F3" />
          <div className="flex items-center justify-between text-[12px] font-medium">
            <span className="text-[rgb(129_134_137/0.9)]">{rewardPool.countdownLabel}</span>
            <span className="text-white/85">{rewardPool.countdown}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function TasksCard() {
  const { tasks } = platform;

  return (
    <Card delay={330} className="flex w-full flex-col gap-8 lg:flex-1">
      <div className="flex items-center justify-between">
        <CardLabel>{tasks.label}</CardLabel>
        <CardLabel>{tasks.resets}</CardLabel>
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.items.map((task, index) => (
          <li
            key={task.label}
            className="flex items-center gap-[13px]"
            style={{ "--i": index } as React.CSSProperties}
          >
            <span className="flex flex-1 items-center gap-[8.2px]">
              {task.done ? (
                <CheckIcon />
              ) : (
                <span aria-hidden className="size-4 rounded-[2px] border border-white/25" />
              )}
              <span
                className={cn(
                  "led-task-text text-[12px] font-medium",
                  task.done ? "text-white/50" : "text-white/88",
                )}
              >
                {task.label}
              </span>
            </span>

            <span className="w-[90px] sm:w-[140.43px]">
              <Progress value={task.progress} color={task.done ? "#3FD08B" : "#2BB9F3"} />
            </span>

            <span
              className={cn(
                "led-task-text w-[61px] text-right text-[12px] font-bold",
                task.done ? "text-[rgb(63_208_139/0.95)]" : "text-[rgb(43_185_243/0.95)]",
              )}
            >
              {task.reward}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActivityCard() {
  const { activity } = platform;

  return (
    <Card delay={410} className="flex w-full flex-col gap-8 lg:flex-1">
      <div className="flex items-start gap-[24.6px]">
        <CardLabel className="flex-1">{activity.label}</CardLabel>
        <span className="flex items-center gap-[8.2px] text-[12px] font-bold tracking-[1.49px] text-[#3FD08B] uppercase">
          {activity.liveLabel}
          <span aria-hidden className="size-2 rounded-full bg-[#3FD08B]" />
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {activity.items.map((item, index) => (
          <li
            key={item.time}
            className="led-row flex items-center justify-between"
            style={{ "--i": index } as React.CSSProperties}
          >
            <span className="flex items-center gap-[22.55px]">
              <span className="text-[10.25px] font-medium tracking-[0.18px] text-[rgb(129_134_137/0.85)]">
                {item.time}
              </span>
              <span className="text-[12px] font-medium text-white/75">{item.label}</span>
            </span>
            <span className="led-flash text-right text-[12px] font-bold text-[rgb(43_185_243/0.95)]">
              {item.points}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Flat-top hexagon pip: solid once the tier is reached, hairline before it. */
function TierPip({ color, reached, label }: { color: string; reached: boolean; label: string }) {
  return (
    <svg viewBox="0 0 24 26" role="img" aria-label={label} className="h-[15px] w-[14px]">
      <polygon
        points="6,1 18,1 23,13 18,25 6,25 1,13"
        fill={reached ? color : "none"}
        stroke={color}
        strokeOpacity={reached ? 1 : 0.3}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="#3FD08B"
      strokeWidth="1.76"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path className="led-tick" d="m2.3 8.6 4 4 7.4-9" />
    </svg>
  );
}
