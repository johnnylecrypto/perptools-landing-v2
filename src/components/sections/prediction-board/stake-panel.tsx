import { cn } from "@/lib/utils";
import { formatPoints } from "@/lib/prediction-engine";
import { GripIcon } from "@/components/icons/grip";
import { StepperButton } from "./stepper-button";

/**
 * Stake stepper. The design file docks it over the bottom edge of the board, so
 * it hangs on a negative margin now that the board is laid out in flow.
 */
export function StakePanel({
  stake,
  balance,
  onChange,
  className,
}: {
  stake: number;
  balance: number;
  onChange: (direction: 1 | -1) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative z-[3] mx-auto -mt-8 w-[282px] max-w-full overflow-hidden rounded-xl bg-[#030D14] p-[9px] shadow-[0_0.75px_4.35px_rgb(43_185_243/0.2),inset_0_0_0_0.75px_#122B3A]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute top-[-15px] left-[12.75px] h-[39px] w-[260.25px] rounded-full bg-[linear-gradient(180deg,rgb(0_173_239/0.12)_55%,rgb(157_179_198/0.12)_100%)] blur-[24.47px]"
      />
      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <GripIcon />
          <span className="text-[12px] leading-[18px] font-semibold text-white/87">Stake</span>
        </div>
        <div className="flex flex-1 items-center gap-1.5">
          <StepperButton label="Decrease stake" onClick={() => onChange(-1)}>
            <span className="block h-[0.75px] w-[9px] bg-white/87" />
          </StepperButton>
          <div className="flex h-6 flex-1 items-center gap-1.5 rounded-md bg-[#010101] px-[7.5px] shadow-[inset_0_0_0_0.75px_#122B3A]">
            <span className="flex-1 text-[10.5px] leading-[15px] text-white tabular-nums">
              {formatPoints(stake)}
            </span>
            <span className="text-[10.5px] leading-[15px] text-white/87">PTS</span>
            <span
              aria-hidden
              className={cn(
                "size-3 rounded-full",
                stake > balance ? "bg-[#FF7578]/70" : "bg-[#2BB9F3]/70",
              )}
            />
          </div>
          <StepperButton label="Increase stake" onClick={() => onChange(1)}>
            <span className="relative block size-[9px]">
              <span className="absolute top-1/2 left-0 h-[0.75px] w-full -translate-y-1/2 bg-white/87" />
              <span className="absolute top-0 left-1/2 h-full w-[0.75px] -translate-x-1/2 bg-white/87" />
            </span>
          </StepperButton>
        </div>
      </div>
    </div>
  );
}
