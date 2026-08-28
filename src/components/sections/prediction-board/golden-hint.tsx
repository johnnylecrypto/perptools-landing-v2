/** "Golden cube hidden on the board", as the live app teases it. */
export function GoldenHint() {
  return (
    <div
      aria-hidden
      className="bg-warning/15 text-warning pointer-events-none absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] leading-4 font-semibold whitespace-nowrap shadow-[inset_0_0_0_1px_--alpha(var(--color-warning)/40%)] backdrop-blur-[9.64px]"
    >
      <span className="animate-pulse">✦</span>
      Golden cube on the board
    </div>
  );
}
