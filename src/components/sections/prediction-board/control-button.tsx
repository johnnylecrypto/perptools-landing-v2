import { cn } from "@/lib/utils";

export function ControlButton({
  icon,
  className,
  label,
  onClick,
  pressed,
}: {
  icon: React.ReactNode;
  className?: string;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "absolute z-[2] flex size-6 cursor-pointer items-center justify-center rounded-[5.25px] p-[3px]",
        "shadow-[0_1.5px_4.5px_--alpha(var(--color-black)/35%),inset_0_0_0_0.75px_--alpha(var(--color-white)/15%)] backdrop-blur-[11.25px]",
        "transition-colors",
        pressed ? "bg-accent/30" : "bg-white/10 hover:bg-white/20",
        className,
      )}
    >
      {icon}
    </button>
  );
}
