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
        "shadow-[0_1.5px_4.5px_rgb(0_0_0/0.35),inset_0_0_0_0.75px_rgb(255_255_255/0.15)] backdrop-blur-[11.25px]",
        "transition-colors",
        pressed ? "bg-[#2BB9F3]/30" : "bg-white/10 hover:bg-white/20",
        className,
      )}
    >
      {icon}
    </button>
  );
}
