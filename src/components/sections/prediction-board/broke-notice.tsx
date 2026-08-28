export function BrokeNotice({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-x-0 top-1/2 z-[2] flex -translate-y-1/2 flex-col items-center gap-3 px-6 text-center">
      <p className="bg-board-bg/85 rounded-lg px-4 py-2 text-[12px] leading-4 font-semibold text-white/87 backdrop-blur-[9.64px]">
        Out of demo points — lower your stake or start over.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-fg-on-accent cursor-pointer rounded-lg bg-[image:var(--gradient-accent-bright)] px-4 py-2 text-[12px] leading-4 font-bold"
      >
        Start over
      </button>
    </div>
  );
}
