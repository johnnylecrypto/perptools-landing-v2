"use client";

import { useMemo, useState } from "react";
import { points } from "@/content/points";
import { usePredictionGame } from "@/lib/use-prediction-game";
import { useWorldScroll } from "@/lib/use-world-scroll";
import {
  SUBTICKS_PER_COLUMN,
  currentColumn,
  firstPlayableColumn,
  firstVisibleColumn,
  formatMultiplier,
  formatPoints,
  goldenRowFor,
  ladderOf,
  priceToFraction,
  sigmaOf,
} from "@/lib/prediction-engine";
import { HelpIcon } from "@/components/icons/help";
import { PauseIcon } from "@/components/icons/pause";
import { PlayIcon } from "@/components/icons/play";
import { ResetIcon } from "@/components/icons/reset";
import { buildChartFrame } from "./chart-frame";
import { BrokeNotice } from "./broke-notice";
import { ControlButton } from "./control-button";
import { GoldenHint } from "./golden-hint";
import { Grid } from "./grid";
import { HelpOverlay } from "./help-overlay";
import { Hud } from "./hud";
import { MarketBar } from "./market-bar";
import { NowLine } from "./now-line";
import { PointsBar } from "./points-bar";
import { PriceLadder } from "./price-ladder";
import { PriceLine } from "./price-line";
import { ResultToast } from "./result-toast";
import { StakePanel } from "./stake-panel";
import { TimeAxis } from "./time-axis";

/**
 * Playable Tap Predictions demo.
 *
 * The grid is price bands (rows) against time windows (columns). Tap a cell
 * right of the NOW line to stake on price touching that band while that window
 * is open; the playhead settles it a few seconds later.
 *
 * Presentation follows the live board (`perptools-site` TradeCanvas), which
 * draws to a canvas — the palette, cell treatment, axis placement and framing
 * are ported here as DOM. Cells are square via `aspect-ratio`, so the board
 * sizes itself from its width with no measuring pass and no layout shift.
 */
export function PredictionBoard() {
  const { state, market, marketIndex, geometry, paused, running, feedStatus, boardRef, actions } =
    usePredictionGame(points.markets);
  const [help, setHelp] = useState(false);

  const price = state.prices[state.prices.length - 1] ?? state.anchor;
  // Stable identity while the anchor holds: a fresh object every tick would
  // defeat `Grid`'s memo and re-render all four hundred cells regardless.
  const ladder = useMemo(() => ladderOf(state.anchor), [state.anchor]);
  const col0 = firstVisibleColumn(state, geometry);
  const currentCol = currentColumn(state);
  const playFrom = firstPlayableColumn(state, geometry);
  const broke = state.stake > state.balance;

  // Repricing every cell is the expensive part of a tick, and the odds do not
  // meaningfully change inside one band. Quantising both pricer inputs to a
  // whole band means the grid reprices when the price actually crosses a row,
  // not four times a second — which is what keeps the scroll from stuttering.
  const quantisedPrice = Math.round(price / ladder.band) * ladder.band;
  // Two significant figures: the volatility estimate drifts on every sample,
  // and at full precision it alone would re-render the grid four times a second.
  const quantisedSigma = Number(sigmaOf(state).toPrecision(2));
  const priceFraction = priceToFraction(price, ladder, geometry.rows);

  // Motion runs on an animation frame rather than on React renders; these refs
  // are what it writes to.
  const chart = useMemo(() => buildChartFrame(state, ladder, geometry), [state, ladder, geometry]);
  const { worldRef, markerRef, lineRef, areaRef } = useWorldScroll({
    subtick: state.subtick,
    subticksPerColumn: SUBTICKS_PER_COLUMN,
    worldColumns: geometry.columns + 1,
    priceFraction,
    chart,
    running,
  });

  // The live board teases the golden cube rather than pointing at it; the hint
  // shows while one is somewhere in the playable range.
  const lastVisible = col0 + geometry.columns - 1;
  const goldenOnBoard = Array.from(
    { length: Math.max(0, lastVisible - playFrom + 1) },
    (_, i) => playFrom + i,
  ).some((column) => goldenRowFor(column, geometry.rows) !== null);

  return (
    <div
      ref={boardRef}
      className="bg-board-bg relative w-full overflow-hidden rounded-2xl p-3 shadow-[inset_0_0_0_1px_--alpha(var(--color-white)/15%)] max-sm:px-0"
    >
      <MarketBar
        marketIndex={marketIndex}
        balance={state.balance}
        feedStatus={feedStatus}
        onSelect={actions.selectMarket}
      />

      {/* Phones run this panel edge to edge: no radius, no side rule, just the
          top border the design draws above the time strip. */}
      <div className="bg-board-bg max-sm:border-board-line relative mt-[9px] overflow-hidden rounded-xl shadow-[inset_0_0_0_0.75px_var(--color-board-line)] max-sm:rounded-none max-sm:border-t max-sm:shadow-none">
        {/* The world: time axis and grid share one transform so they scroll as
            a single sheet, laid out one column wider than the panel so there is
            never a gap at the right edge. `useWorldScroll` drives the transform
            per animation frame; the inline value here is only the server's
            first frame. */}
        <div
          ref={worldRef}
          style={{
            width: `${((geometry.columns + 1) / geometry.columns) * 100}%`,
            willChange: "transform",
          }}
        >
          <TimeAxis geometry={geometry} font={geometry.font} />

          <div className="relative">
            <Grid
              geometry={geometry}
              col0={col0}
              currentCol={currentCol}
              playFrom={playFrom}
              ladder={ladder}
              price={quantisedPrice}
              sigma={quantisedSigma}
              stake={state.stake}
              bets={state.bets}
              disabled={broke}
              onBet={actions.bet}
            />
            <PriceLine frame={chart} lineRef={lineRef} areaRef={areaRef} />
          </div>
        </div>

        {/* Fixed overlays: these are screen furniture, not world content. */}
        <PriceLadder
          geometry={geometry}
          ladder={ladder}
          decimals={market.decimals}
          font={geometry.font}
        />
        <NowLine geometry={geometry} markerRef={markerRef} />

        <Hud taps={state.taps} streak={state.streak} pnl={state.pnl} />

        <ControlButton
          onClick={actions.reset}
          className="bottom-3 left-3"
          label="Reset demo"
          icon={<ResetIcon />}
        />
        <ControlButton
          onClick={actions.togglePaused}
          className="right-3 bottom-3"
          label={paused ? "Resume" : "Pause"}
          icon={paused ? <PlayIcon /> : <PauseIcon />}
        />
        <ControlButton
          onClick={() => setHelp((value) => !value)}
          className="top-8 right-3"
          label={help ? "Hide how it works" : "How it works"}
          icon={<HelpIcon />}
          pressed={help}
        />

        {goldenOnBoard ? <GoldenHint /> : null}
        {state.result ? <ResultToast result={state.result} /> : null}
        {broke ? <BrokeNotice onReset={actions.reset} /> : null}
        {help ? <HelpOverlay onClose={() => setHelp(false)} /> : null}
      </div>

      {/* Phones get the design's two PTS pills; the stepper needs the width the
          mobile card does not have. */}
      <PointsBar balance={state.balance} stake={state.stake} onChange={actions.changeStake} />
      <StakePanel
        stake={state.stake}
        balance={state.balance}
        onChange={actions.changeStake}
        className="hidden sm:block"
      />

      {/* Settlements are visual; announce them for screen readers too. */}
      <p role="status" aria-live="polite" className="sr-only">
        {state.result
          ? state.result.status === "won"
            ? `Won ${formatPoints(state.result.delta)} points at ${formatMultiplier(state.result.multiplier)}.`
            : `Missed. Lost ${formatPoints(Math.abs(state.result.delta))} points.`
          : ""}
      </p>
    </div>
  );
}
