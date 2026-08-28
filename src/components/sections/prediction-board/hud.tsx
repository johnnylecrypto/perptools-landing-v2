import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/prediction-engine";
import { BarIcon } from "@/components/icons/bar";
import { FireIcon } from "@/components/icons/fire";
import { TapIcon } from "@/components/icons/tap";

export function Hud({ taps, streak, pnl }: { taps: number; streak: number; pnl: number }) {
  return (
    <div className="absolute top-8 left-3 z-[2] flex h-[18px] items-center gap-1.5 rounded-xl bg-[#061928] py-[1.5px] pr-[3px] pl-[7.5px] shadow-[0_0_4.5px_#124D65,inset_0_0_0_0.75px_rgb(43_185_243/0.5)] backdrop-blur-[9.64px]">
      <span className="flex items-center gap-[3px] text-[9px] leading-3 font-semibold text-white/87 tabular-nums">
        <TapIcon />
        {taps}
      </span>
      <span className="flex items-center gap-[3px] text-[9px] leading-3 font-semibold text-white/87 tabular-nums">
        <FireIcon />
        {streak}
      </span>
      <span
        className={cn(
          "flex h-3 items-center gap-[3px] rounded-xl px-1.5 text-[9px] leading-3 font-semibold tabular-nums",
          pnl < 0
            ? "bg-[rgb(255_117_120/0.15)] text-[#FF7578]"
            : "bg-[rgb(63_208_139/0.15)] text-[#3FD08B]",
        )}
      >
        <BarIcon negative={pnl < 0} />
        {formatSigned(pnl)}
      </span>
    </div>
  );
}
