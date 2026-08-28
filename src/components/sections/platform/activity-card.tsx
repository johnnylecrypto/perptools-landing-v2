import { platform } from "@/content/platform";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";

export function ActivityCard() {
  const { activity } = platform;

  return (
    <PlatformCard delay={410} className="flex w-full flex-col gap-8 lg:flex-1">
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
    </PlatformCard>
  );
}
