/** "Golden cube hidden on the board", as the live app teases it. */
export function GoldenHint() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[rgb(254_185_65/0.15)] px-3 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap text-[#F6C14B] shadow-[inset_0_0_0_1px_rgb(246_193_75/0.4)] backdrop-blur-[9.64px]"
    >
      <span className="animate-pulse">✦</span>
      Golden cube on the board
    </div>
  );
}
