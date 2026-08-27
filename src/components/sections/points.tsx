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
      className="py-section relative isolate overflow-hidden"
    >
      {/* atmos/screen-glow: 1621x987 radial wash centred on the section. */}
      <Ellipse
        color="radial-gradient(closest-side, rgb(43 185 243 / 0.22) 0%, rgb(43 185 243 / 0.06) 55%, rgb(43 185 243 / 0) 100%)"
        width={1621}
        height={987}
        blur={0}
        blend="normal"
        className="top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="px-side w-full lg:px-[85px]">
        {/* 85px section gutter + 96.5px inner padding = the design's 1080 content frame. */}
        <div className="flex w-full flex-col items-center gap-16 lg:px-[96.5px]">
          <header className="flex flex-col items-center gap-[18.89px] text-center">
            <h2
              id="points-heading"
              className="max-w-[874.88px] text-[clamp(30px,5vw,48px)] leading-[1.05] font-bold text-balance text-white mix-blend-lighten"
            >
              {points.heading}
            </h2>
            <p className="max-w-[599px] text-[16px] leading-[26px] font-medium text-pretty text-[#7A8494]">
              {points.lede}
            </p>
          </header>

          {/* The board picks its own column and row count per breakpoint, so it
              fits the viewport instead of scrolling sideways. */}
          <div className="flex w-full flex-col items-center gap-4">
            <PredictionBoard />
            <p className="text-center text-[12px] leading-4 text-[#5C6674]">{points.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
