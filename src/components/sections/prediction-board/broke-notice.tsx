export function BrokeNotice({ onReset }: { onReset: () => void }) {
  return (
    <div className="absolute inset-x-0 top-1/2 z-[2] flex -translate-y-1/2 flex-col items-center gap-3 px-6 text-center">
      <p className="rounded-lg bg-[#010101]/85 px-4 py-2 text-[12px] leading-4 font-semibold text-white/87 backdrop-blur-[9.64px]">
        Out of demo points — lower your stake or start over.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="cursor-pointer rounded-lg bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] px-4 py-2 text-[12px] leading-4 font-bold text-[#050505]"
      >
        Start over
      </button>
    </div>
  );
}
