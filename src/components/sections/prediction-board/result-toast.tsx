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
          ? "bg-success/18 text-success-light shadow-[inset_0_0_0_1px_--alpha(var(--color-success)/50%)]"
          : "bg-danger/18 text-danger-light shadow-[inset_0_0_0_1px_--alpha(var(--color-danger)/50%)]",
      )}
    >
      {won ? "Touched" : "Missed"} · {formatSigned(result.delta)} PTS
    </div>
  );
}
