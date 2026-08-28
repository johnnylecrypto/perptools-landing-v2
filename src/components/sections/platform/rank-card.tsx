import Image from "next/image";
import { platform } from "@/content/platform";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";
import { Progress } from "./progress";
import { TierPip } from "./tier-pip";

export function RankCard() {
  const { rank } = platform;

  return (
    <PlatformCard delay={80} className="flex flex-col gap-4 lg:flex-[257_1_0%]">
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
    </PlatformCard>
  );
}
