import { points } from "@/content/points";

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-[4] flex items-center justify-center bg-[#010101]/88 px-6 backdrop-blur-[6px]">
      <div className="max-w-[420px]">
        <h3 className="text-[14px] leading-5 font-bold text-white">{points.help.title}</h3>
        <ol className="mt-3 flex flex-col gap-2">
          {points.help.steps.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-[12px] leading-[18px] text-white/75">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[rgb(43_185_243/0.15)] text-[9px] font-bold text-[#2BB9F3]">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 cursor-pointer rounded-lg bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] px-4 py-2 text-[12px] leading-4 font-bold text-[#050505]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
