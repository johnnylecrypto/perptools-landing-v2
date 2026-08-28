import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/prediction-engine";

export function ResultToast({ result }: { result: { status: "won" | "lost"; delta: number } }) {
  const won = result.status === "won";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-8 left-1/2 z-[2] -translate-x-1/2 rounded-lg px-3 py-1.5",
        "text-[12px] leading-4 font-bold tabular-nums backdrop-blur-[9.64px]",
        won
          ? "bg-[rgb(63_208_139/0.18)] text-[#8CF0C0] shadow-[inset_0_0_0_1px_rgb(63_208_139/0.5)]"
          : "bg-[rgb(255_117_120/0.18)] text-[#FFC3C4] shadow-[inset_0_0_0_1px_rgb(255_117_120/0.5)]",
      )}
    >
      {won ? "Touched" : "Missed"} · {formatSigned(result.delta)} PTS
    </div>
  );
}
