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
        "bg-board-panel relative z-[3] mx-auto -mt-8 w-[282px] max-w-full overflow-hidden rounded-xl p-[9px] shadow-[0_0.75px_4.35px_--alpha(var(--color-accent)/20%),inset_0_0_0_0.75px_var(--color-board-line)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute top-[-15px] left-[12.75px] h-[39px] w-[260.25px] rounded-full bg-[linear-gradient(180deg,--alpha(var(--color-accent)/12%)_55%,--alpha(var(--color-fg-muted)/12%)_100%)] blur-[24.47px]"
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
          <div className="bg-board-bg flex h-6 flex-1 items-center gap-1.5 rounded-md px-[7.5px] shadow-[inset_0_0_0_0.75px_var(--color-board-line)]">
            <span className="flex-1 text-[10.5px] leading-[15px] text-white tabular-nums">
              {formatPoints(stake)}
            </span>
            <span className="text-[10.5px] leading-[15px] text-white/87">PTS</span>
            <span
              aria-hidden
              className={cn(
                "size-3 rounded-full",
                stake > balance ? "bg-danger/70" : "bg-accent/70",
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
