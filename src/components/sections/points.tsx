import { points } from "@/content/points";
import { PredictionBoard } from "@/components/sections/prediction-board";
import { Ellipse } from "@/components/ui/ellipse";

/**
 * Tap Predictions pitch: centred heading over the live board.
 *
 * The board is a fixed 1080px canvas from the design file, so it scrolls
 * horizontally rather than reflowing on narrow viewports.
 */
export function Points() {
  return (
    <section
      id="points"
      aria-labelledby="points-heading"
      className="relative isolate overflow-hidden"
    >
      {/* atmos/screen-glow: 1621x987 radial wash centred on the section. */}
      <Ellipse
        color="radial-gradient(closest-side, color-mix(in oklab, var(--color-accent) 22%, transparent) 0%, color-mix(in oklab, var(--color-accent) 6%, transparent) 55%, transparent 100%)"
        width={1621}
        height={987}
        blur={0}
        blend="normal"
        className="top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="frame w-full">
        <div className="flex w-full flex-col items-center gap-16">
          <header className="flex flex-col items-center gap-[18.89px] text-center">
            <h2
              id="points-heading"
              className="heading-sheen max-w-[874.88px] text-[32px] leading-[38.4px] font-medium text-balance sm:text-[clamp(30px,5vw,48px)] sm:leading-none"
            >
              {points.heading}
            </h2>
            <p className="text-fg-subtle max-w-[599px] text-[16px] leading-[26px] font-medium text-pretty">
              {points.lede}
            </p>
          </header>

          {/* The board picks its own column and row count per breakpoint, so it
              fits the viewport instead of scrolling sideways. */}
          <div className="flex w-full flex-col items-center gap-4">
            <PredictionBoard />
            <p className="text-fg-faint text-center text-[12px] leading-4">{points.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
