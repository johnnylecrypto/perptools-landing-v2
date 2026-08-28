export function StepperButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md bg-white/5 shadow-[inset_0_0_0_0.75px_rgb(255_255_255/0.05)] transition-colors hover:bg-white/12"
    >
      {children}
    </button>
  );
}
