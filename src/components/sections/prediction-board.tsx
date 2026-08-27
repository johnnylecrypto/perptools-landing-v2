"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { points } from "@/content/points";
import { cn } from "@/lib/utils";
import { PointMarker } from "@/components/ui/point-marker";
import { usePredictionGame } from "@/lib/use-prediction-game";
import type { FeedStatus } from "@/lib/price-feed";
import { useWorldScroll } from "@/lib/use-world-scroll";
import {
  SUBTICKS_PER_COLUMN,
  TIME_STRIP_HEIGHT,
  bandFor,
  currentColumn,
  firstPlayableColumn,
  firstVisibleColumn,
  formatMultiplier,
  formatPoints,
  formatPrice,
  formatSigned,
  goldenRowFor,
  ladderOf,
  applyGolden,
  isGoldenCell,
  multiplierFor,
  priceToFraction,
  rowOf,
  sigmaOf,
  timeLabel,
  type Bet,
  type GameState,
  type Geometry,
  type Ladder,
} from "@/lib/prediction-engine";

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
  const { worldRef, markerRef } = useWorldScroll({
    subtick: state.subtick,
    subticksPerColumn: SUBTICKS_PER_COLUMN,
    worldColumns: geometry.columns + 1,
    priceFraction,
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
      className="relative w-full overflow-hidden rounded-2xl bg-[#010101] p-3 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]"
    >
      <MarketBar
        marketIndex={marketIndex}
        balance={state.balance}
        feedStatus={feedStatus}
        onSelect={actions.selectMarket}
      />

      <div className="relative mt-[9px] overflow-hidden rounded-xl bg-[#010101] shadow-[inset_0_0_0_0.75px_#122B3A]">
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
            <PriceLine state={state} ladder={ladder} geometry={geometry} />
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

      <StakePanel stake={state.stake} balance={state.balance} onChange={actions.changeStake} />

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

// --- grid -------------------------------------------------------------------

type GridProps = {
  geometry: Geometry;
  col0: number;
  currentCol: number;
  playFrom: number;
  ladder: Ladder;
  /** Spot, quantised to its band so the grid only reprices on a band change. */
  price: number;
  /** Realised volatility, quantised for the same reason. */
  sigma: number;
  stake: number;
  bets: readonly Bet[];
  disabled: boolean;
  onBet: (row: number, column: number) => void;
};

/**
 * Memoised: the reducer ticks four times per column, but the grid only changes
 * when the window scrolls, the price crosses a band, or a bet moves.
 */
const Grid = memo(function Grid({
  geometry,
  col0,
  currentCol,
  playFrom,
  ladder,
  price,
  sigma,
  stake,
  bets,
  disabled,
  onBet,
}: GridProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Roving tabindex in *visible* coordinates, so the focused cell stays put
  // while the world scrolls underneath it.
  const firstPlayable = playFrom - col0;
  const [focus, setFocus] = useState({
    row: Math.floor(geometry.rows / 2),
    column: firstPlayable,
  });

  const move = useCallback(
    (rowDelta: number, columnDelta: number) => {
      setFocus((current) => {
        const row = Math.min(geometry.rows - 1, Math.max(0, current.row + rowDelta));
        const column = Math.min(
          // The world carries a spare column past the panel edge; it is on
          // screen only mid-scroll, so keyboard focus stays out of it.
          geometry.columns - 1,
          Math.max(firstPlayable, current.column + columnDelta),
        );
        ref.current?.querySelector<HTMLButtonElement>(`[data-cell="${row}-${column}"]`)?.focus();
        return { row, column };
      });
    },
    [geometry.rows, geometry.columns, firstPlayable],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    const deltas: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const delta = deltas[event.key];
    if (!delta) return;
    event.preventDefault();
    move(delta[0], delta[1]);
  };

  /** Read `row-column` off whichever cell an event came from. */
  const coordsOf = (event: React.SyntheticEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-cell]");
    if (!cell) return null;
    const [row, column] = cell.dataset.cell!.split("-").map(Number);
    return { row, column };
  };

  // Click and focus are handled here rather than per cell. That keeps every
  // cell's props primitive, which is what lets `CellView` memoise: a tick that
  // moves one multiplier then re-renders one cell instead of four hundred.
  const onClick = (event: React.MouseEvent) => {
    const at = coordsOf(event);
    if (at) onBet(at.row, col0 + at.column);
  };

  const onFocus = (event: React.FocusEvent) => {
    const at = coordsOf(event);
    if (at) setFocus(at);
  };

  // Keyed by where each bet sits on the ladder *now*: the ladder shifts under
  // the price, so a bet's row is not the one it was placed on.
  const byCell = new Map(
    bets.map((bet) => [`${rowOf(bet, ladder, geometry.rows)}-${bet.column}`, bet]),
  );

  return (
    <div
      ref={ref}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
      aria-label="Prediction grid: price bands by time window"
      className="grid"
      style={{ gridTemplateColumns: `repeat(${geometry.columns + 1}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: geometry.rows }, (_, row) =>
        Array.from({ length: geometry.columns + 1 }, (_, column) => {
          const absolute = col0 + column;
          const bet = byCell.get(`${row}-${absolute}`);
          const settled = absolute < playFrom - 1;
          const golden = !settled && isGoldenCell(row, absolute, geometry.rows);

          // Priced here, not inside the cell, and rounded to what actually gets
          // printed — so a cell only re-renders when its visible odds change.
          const label =
            settled || bet
              ? ""
              : formatMultiplier(
                  (golden ? applyGolden : identity)(
                    multiplierFor(row, absolute - currentCol, price, sigma, ladder, geometry.rows),
                  ),
                );

          return (
            <CellView
              key={`${row}-${column}`}
              row={row}
              column={column}
              kind={settled ? "settled" : absolute === playFrom - 1 ? "locked" : "open"}
              label={label}
              golden={golden}
              font={geometry.font}
              stake={stake}
              timeOffset={column - (geometry.nowColumn - 1)}
              bet={bet}
              stackable={!!bet && bet.status === "pending" && absolute >= playFrom && !disabled}
              disabled={disabled}
              focused={focus.row === row && focus.column === column}
            />
          );
        }),
      )}
    </div>
  );
});

const identity = <T,>(value: T) => value;

/**
 * Grid hairlines, 0.75px in the design file. Settled cells carry the darker
 * `#061928`; live ones step up to `#122B3A`.
 */
const EMPTY_EDGE = "border-t-[0.75px] border-l-[0.75px] border-[#061928]";
const CELL_EDGE = "border-t-[0.75px] border-l-[0.75px] border-[#122B3A]";

type CellProps = {
  row: number;
  column: number;
  kind: "settled" | "locked" | "open";
  /** Pre-formatted odds; empty for a settled cell or one holding a bet. */
  label: string;
  golden: boolean;
  font: number;
  stake: number;
  timeOffset: number;
  bet: Bet | undefined;
  stackable: boolean;
  disabled: boolean;
  focused: boolean;
};

/**
 * One grid cell.
 *
 * Memoised on primitives. The board reprices continuously, but a given cell's
 * printed odds change far less often than that, so this is what keeps a tick
 * from reconciling the whole grid and dropping a frame mid-scroll.
 */
const CellView = memo(function CellView({
  row,
  column,
  kind,
  label,
  golden,
  font,
  stake,
  timeOffset,
  bet,
  stackable,
  disabled,
  focused,
}: CellProps) {
  if (bet) {
    return <BetCell bet={bet} font={font} stackable={stackable} row={row} column={column} />;
  }

  // Settled columns and the one still resolving render as bare grid.
  if (kind === "settled") {
    return <div className={cn("aspect-square", EMPTY_EDGE)} />;
  }

  if (kind === "locked") {
    return (
      <div
        className={cn(
          "relative aspect-square opacity-50",
          golden ? "bg-[rgb(254_185_65/0.2)]" : "bg-[#061928]",
          CELL_EDGE,
        )}
      >
        <CellLabel font={font} className="text-[rgb(43_185_243/0.5)]">
          {label}
        </CellLabel>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-cell={`${row}-${column}`}
      tabIndex={focused ? 0 : -1}
      disabled={disabled}
      aria-label={`Stake ${formatPoints(stake)} points on ${label} band, ${timeLabel(timeOffset)}`}
      className={cn(
        "group relative aspect-square",
        // An idle golden cube sits under a warm wash instead of the usual ink.
        golden ? "bg-[rgb(254_185_65/0.2)]" : "bg-[#061928]",
        CELL_EDGE,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        // The product's hover: a 2px cyan ring and a flat white 12% wash.
        !disabled &&
          (golden
            ? "hover:shadow-[inset_0_0_0_2px_#F6C14B] focus-visible:shadow-[inset_0_0_0_2px_#F6C14B]"
            : "hover:shadow-[inset_0_0_0_2px_#2BB9F3] focus-visible:shadow-[inset_0_0_0_2px_#2BB9F3]"),
      )}
    >
      {!disabled ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-colors duration-100 group-hover:bg-white/12 group-focus-visible:bg-white/12"
        />
      ) : null}
      <CellLabel
        font={font}
        className={cn(
          "transition-colors",
          golden
            ? "text-[#F6C14B]"
            : "text-[rgb(43_185_243/0.5)] group-hover:text-[#2BB9F3] group-focus-visible:text-[#2BB9F3]",
        )}
      >
        {label}
      </CellLabel>
    </button>
  );
});

function CellLabel({
  font,
  className,
  children,
}: {
  font: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{ fontSize: font }}
      className={cn(
        "absolute inset-0 flex items-center justify-center leading-none font-semibold tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A staked cell.
 *
 * The product insets it by 1px, rounds it to 7.5 and gives it a cyan drop glow,
 * then prints the odds above the *potential payout* — not the stake, so the
 * number you are playing for is the one you read.
 *
 * Three variants beyond the plain one, all from the live board:
 *  - stacked (`betCount >= 2`) burns brighter and flips to dark text;
 *  - golden pays the capped bonus and goes gold;
 *  - a win turns `#041a08`/`#00ff88`, punches once, and throws a score badge.
 */
function BetCell({
  bet,
  font,
  stackable,
  row,
  column,
}: {
  bet: Bet;
  font: number;
  stackable: boolean;
  row: number;
  column: number;
}) {
  const won = bet.status === "won";
  const lost = bet.status === "lost";
  const doubled = bet.betCount >= 2;
  const dark = !won && (bet.golden || doubled);
  const Tag = stackable ? "button" : "div";

  return (
    <Tag
      {...(stackable
        ? {
            type: "button" as const,
            "data-cell": `${row}-${column}`,
            "aria-label": `Add ${formatMultiplier(bet.multiplier)} stake to this cell`,
          }
        : {})}
      data-bet="true"
      className={cn("relative aspect-square", CELL_EDGE, stackable && "cursor-pointer")}
    >
      <div
        className={cn(
          "absolute inset-[1px] flex flex-col items-center justify-center overflow-hidden rounded-[7.5px] border-2",
          won &&
            "animate-cell-punch border-[#00ff88] bg-[#041a08] shadow-[0_0_24px_rgb(0_255_136/0.45)]",
          lost &&
            "border-[#FF7578]/50 bg-[linear-gradient(180deg,#3A1015_0%,#120608_100%)] opacity-0 transition-opacity duration-[1600ms]",
          !won &&
            !lost &&
            bet.golden &&
            "border-[#F6C14B] bg-[#DEC05F] shadow-[0_0_13.5px_rgb(246_193_75/0.6)]",
          !won &&
            !lost &&
            !bet.golden &&
            (doubled
              ? "border-[#2BB9F3] bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] shadow-[0_0_14px_#2BB9F3]"
              : "border-[#2BB9F3] bg-[linear-gradient(180deg,#0070A9_0%,#061928_100%)] shadow-[0_0_13.5px_#2BB9F3D9]"),
        )}
      >
        {won ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgb(0_200_80/0.25)_0%,transparent_70%)]"
          />
        ) : null}

        {/* 9px medium over 10.5px semibold, as the design file sets them. */}
        <span
          style={{ fontSize: font - 1.5 }}
          className={cn(
            "relative leading-none font-medium",
            dark ? "text-[#050505]" : "text-white",
          )}
        >
          {formatMultiplier(bet.multiplier)}
        </span>
        <span
          style={{ fontSize: font }}
          className={cn(
            "relative leading-none font-semibold tabular-nums",
            won ? "text-[#8CF0C0]" : dark ? "text-[#050505]" : "text-[#2BB9F3]",
          )}
        >
          {won ? formatPoints(bet.payout) : (bet.stake * bet.multiplier).toFixed(2)}
        </span>
      </div>

      {/* Payout badge rising out of the cell, as the live board throws it. */}
      {won ? (
        <span
          aria-hidden
          className="animate-score-rise pointer-events-none absolute -top-2 left-1/2 z-[3] -translate-x-1/2 text-[15px] leading-none font-extrabold whitespace-nowrap text-[#8CF0C0] [text-shadow:0_0_10px_rgb(0_255_136/0.6)]"
        >
          + {formatPoints(bet.payout)}
        </span>
      ) : null}
    </Tag>
  );
}

// --- chart ------------------------------------------------------------------

/** Where the NOW line sits, as a fraction of the panel: fixed, by construction. */
function nowFraction(geometry: Geometry) {
  return (geometry.nowColumn - 1) / geometry.columns;
}

/**
 * Settled price action, drawn in world coordinates so it scrolls with the grid.
 *
 * Follows the product: a quadratic-smoothed path rather than raw segments, a 2px
 * translucent cyan stroke, and an area wash fading out at the bottom. The tip
 * marker is not drawn here — it belongs to the fixed NOW overlay, so it stays
 * rock steady while the sheet slides underneath it.
 */
function PriceLine({
  state,
  ladder,
  geometry,
}: {
  state: GameState;
  ladder: Ladder;
  geometry: Geometry;
}) {
  const col0 = firstVisibleColumn(state, geometry);
  const from = Math.max(0, col0 * SUBTICKS_PER_COLUMN);
  const worldColumns = geometry.columns + 1;

  const pts: { x: number; y: number }[] = [];
  for (let i = from; i <= state.subtick; i += 1) {
    const price = state.prices[i];
    if (price === undefined) continue;
    // World position in columns, mapped across the world's width.
    const worldColumn = i / SUBTICKS_PER_COLUMN - col0;
    pts.push({
      x: (worldColumn / worldColumns) * 100,
      y: (1 - priceToFraction(price, ladder, geometry.rows)) * 100,
    });
  }

  if (pts.length < 2) return null;
  const path = smoothPath(pts);
  const tail = pts[pts.length - 1].x;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <defs>
        <linearGradient id="pt-price-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2BB9F3" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2BB9F3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${tail},100 L ${pts[0].x},100 Z`} fill="url(#pt-price-fill)" />
      <path
        d={path}
        fill="none"
        stroke="#2BB9F3"
        strokeOpacity="0.65"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Midpoint-quadratic smoothing, the same curve the product's `smoothPath` draws. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x},${pts[i].y} ${midX},${midY}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L ${last.x},${last.y}`;
}

/**
 * The live edge, pinned to the panel rather than the world.
 *
 * The product stacks a wide soft stroke under a thin bright one and hangs a
 * "Now" pill off it; the price marker rides it at the current price.
 */
/**
 * The live edge, pinned to the panel rather than the world.
 *
 * Neither the sheet's `transform` nor this marker's `top` is a React style
 * prop. `useWorldScroll` writes both every animation frame, and a style prop
 * would be re-applied on any re-render that happened mid-tick — snapping the
 * board back to where the tick started. That is what made it flash.
 */
function NowLine({
  geometry,
  markerRef,
}: {
  geometry: Geometry;
  markerRef: React.Ref<HTMLSpanElement>;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[1]"
      style={{ left: `${nowFraction(geometry) * 100}%`, top: TIME_STRIP_HEIGHT, bottom: 0 }}
    >
      <span className="absolute inset-y-0 left-0 w-2 -translate-x-1/2 bg-[rgb(43_185_243/0.25)] blur-[6px]" />
      <span className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-[#2BB9F3]/65 shadow-[0_0_10px_#2BB9F3BF]" />
      <span className="absolute top-[30px] left-1 flex h-6 w-[58px] items-center justify-center rounded-lg bg-[#2BB9F3] text-[13px] leading-none font-semibold text-black shadow-[0_0_8px_#2BB9F3BF]">
        Now
      </span>
      {/* `top` is owned by the animation loop, not by React — see below. */}
      <span ref={markerRef} className="absolute -translate-x-1/2 -translate-y-1/2">
        <PointMarker />
      </span>
    </div>
  );
}

// --- axes -------------------------------------------------------------------

/**
 * Seconds row above the grid.
 *
 * One label per column, so each is exactly a cell wide and the two stay in step
 * however the board is sized. The design file dims and lightens the interior
 * ticks and keeps the outermost ones semibold, which is what stops the row
 * reading as a wall of numbers.
 */
function TimeAxis({ geometry, font }: { geometry: Geometry; font: number }) {
  const total = geometry.columns + 1;
  return (
    <div aria-hidden className="flex bg-[#010101]" style={{ height: TIME_STRIP_HEIGHT }}>
      {Array.from({ length: total }, (_, column) => {
        const offset = column - (geometry.nowColumn - 1);
        const edge = column === 0 || column >= total - 7;
        return (
          <span
            key={column}
            style={{ fontSize: font - 1.5, lineHeight: edge ? "13.5px" : "12px" }}
            className={cn(
              "flex flex-1 items-center justify-center tabular-nums",
              edge ? "font-semibold text-white/36" : "font-normal text-white/40",
            )}
          >
            {offset === 0 ? "" : timeLabel(offset)}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Price ladder. The product prints these over the grid at the left edge, sitting
 * just above each gridline, rather than reserving a column for an axis.
 */
function PriceLadder({
  geometry,
  ladder,
  decimals,
  font,
}: {
  geometry: Geometry;
  ladder: Ladder;
  decimals: number;
  font: number;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0"
      style={{ top: TIME_STRIP_HEIGHT, bottom: 0 }}
    >
      {Array.from({ length: geometry.rows }, (_, row) => (
        <span
          key={row}
          style={{ top: `${(row / geometry.rows) * 100}%`, fontSize: font - 1 }}
          className="absolute left-4 -translate-y-[2px] leading-none text-[rgb(226_232_240/0.8)] tabular-nums"
        >
          {formatPrice(bandFor(row, ladder, geometry.rows).high, decimals)}
        </span>
      ))}
    </div>
  );
}

function MarketBar({
  marketIndex,
  balance,
  feedStatus,
  onSelect,
}: {
  marketIndex: number;
  balance: number;
  feedStatus: FeedStatus;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#010101] p-[9px] shadow-[inset_0_0_0_0.75px_#122B3A]">
      <div className="flex items-center gap-1.5">
        {points.markets.map((entry, index) => (
          <button
            key={entry.symbol}
            type="button"
            aria-pressed={index === marketIndex}
            onClick={() => onSelect(index)}
            className={cn(
              "flex h-6 cursor-pointer items-center gap-[3px] rounded-md px-1.5 py-[4.5px] transition-colors",
              index === marketIndex
                ? "bg-[rgb(43_185_243/0.15)] shadow-[inset_0_0_0_0.75px_#2BB9F3]"
                : "bg-[#061928] shadow-[inset_0_0_0_0.75px_#122B3A] hover:bg-[#0B2E45]",
            )}
          >
            <Image src={entry.logo} alt="" width={12} height={12} className="size-3" />
            <span
              className={cn(
                "text-[10.5px] leading-[15px] font-semibold",
                index === marketIndex ? "text-white" : "text-white/87",
              )}
            >
              {entry.symbol}
            </span>
            <span className="hidden text-[9px] leading-3 font-medium text-[#3FD08B] sm:inline">
              {entry.change}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <FeedBadge status={feedStatus} />
        <p className="flex items-center gap-[3px] text-[10.5px] leading-[15px] whitespace-nowrap">
          <span className="hidden text-[#818689] sm:inline">Prediction Balance:</span>
          <span className="font-bold text-white tabular-nums">{formatPoints(balance)} PTS</span>
        </p>
        {/* Wallet actions are out of scope for a demo, so they only appear
            where there is room for them and stay decorative. */}
        <div aria-hidden className="hidden w-[231px] items-center gap-1.5 xl:flex">
          <span className="flex h-6 flex-1 items-center justify-center rounded-[4.5px] text-[10.5px] leading-[15px] font-bold text-[#2BB9F3] opacity-40 shadow-[inset_0_0_0_0.75px_#2BB9F3]">
            Withdraw
          </span>
          <span className="flex h-6 flex-1 items-center justify-center rounded-[4.5px] bg-[linear-gradient(180deg,#2BB9F3_31%,#8AD9FF_81%)] text-[10.5px] leading-[15px] font-bold text-[#050505] opacity-40">
            Top Up
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Where the prices are coming from.
 *
 * Worth showing plainly: the board falls back to a simulated walk when the feed
 * cannot be reached, and a viewer should be able to tell which one they are
 * looking at rather than assume the numbers are real.
 */
function FeedBadge({ status }: { status: FeedStatus }) {
  const label = status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Simulated";
  const tone =
    status === "live"
      ? "bg-[rgb(63_208_139/0.15)] text-[#3FD08B]"
      : status === "connecting"
        ? "bg-[rgb(235_189_78/0.15)] text-[#EBBD4E]"
        : "bg-white/8 text-white/50";

  return (
    <span
      title={
        status === "live"
          ? "Real BTC/ETH/BNB prices from Binance"
          : status === "offline"
            ? "Price feed unreachable — showing a simulated market"
            : "Connecting to the price feed"
      }
      className={cn(
        "flex h-[18px] items-center gap-[5px] rounded-full px-2 text-[9px] leading-3 font-bold tracking-[0.5px] uppercase",
        tone,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full bg-current", status === "live" && "animate-pulse")}
      />
      {label}
    </span>
  );
}

function Hud({ taps, streak, pnl }: { taps: number; streak: number; pnl: number }) {
  return (
    <div className="absolute top-8 left-3 z-[2] flex h-[18px] items-center gap-1.5 rounded-xl bg-[#061928] py-[1.5px] pr-[3px] pl-[7.5px] shadow-[0_0_4.5px_#124D65,inset_0_0_0_0.75px_rgb(43_185_243/0.5)] backdrop-blur-[9.64px]">
      <span className="flex items-center gap-[3px] text-[9px] leading-3 font-semibold text-white/87 tabular-nums">
        <TapIcon />
        {taps}
      </span>
      <span className="flex items-center gap-[3px] text-[9px] leading-3 font-semibold text-white/87 tabular-nums">
        <FireIcon />
        {streak}
      </span>
      <span
        className={cn(
          "flex h-3 items-center gap-[3px] rounded-xl px-1.5 text-[9px] leading-3 font-semibold tabular-nums",
          pnl < 0
            ? "bg-[rgb(255_117_120/0.15)] text-[#FF7578]"
            : "bg-[rgb(63_208_139/0.15)] text-[#3FD08B]",
        )}
      >
        <BarIcon negative={pnl < 0} />
        {formatSigned(pnl)}
      </span>
    </div>
  );
}

/**
 * Stake stepper. The design file docks it over the bottom edge of the board, so
 * it hangs on a negative margin now that the board is laid out in flow.
 */
function StakePanel({
  stake,
  balance,
  onChange,
}: {
  stake: number;
  balance: number;
  onChange: (direction: 1 | -1) => void;
}) {
  return (
    <div className="relative z-[3] mx-auto -mt-8 w-[282px] max-w-full overflow-hidden rounded-xl bg-[#030D14] p-[9px] shadow-[0_0.75px_4.35px_rgb(43_185_243/0.2),inset_0_0_0_0.75px_#122B3A]">
      <div
        aria-hidden
        className="absolute top-[-15px] left-[12.75px] h-[39px] w-[260.25px] rounded-full bg-[linear-gradient(180deg,rgb(0_173_239/0.12)_55%,rgb(157_179_198/0.12)_100%)] blur-[24.47px]"
      />
      <div className="relative flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <GripIcon />
          <span className="text-[12px] leading-[18px] font-semibold text-white/87">Stake</span>
        </div>
        <div className="flex flex-1 items-center gap-1.5">
          <StepperButton label="Decrease stake" onClick={() => onChange(-1)}>
            <span className="block h-[0.75px] w-[9px] bg-white/87" />
          </StepperButton>
          <div className="flex h-6 flex-1 items-center gap-1.5 rounded-md bg-[#010101] px-[7.5px] shadow-[inset_0_0_0_0.75px_#122B3A]">
            <span className="flex-1 text-[10.5px] leading-[15px] text-white tabular-nums">
              {formatPoints(stake)}
            </span>
            <span className="text-[10.5px] leading-[15px] text-white/87">PTS</span>
            <span
              aria-hidden
              className={cn(
                "size-3 rounded-full",
                stake > balance ? "bg-[#FF7578]/70" : "bg-[#2BB9F3]/70",
              )}
            />
          </div>
          <StepperButton label="Increase stake" onClick={() => onChange(1)}>
            <span className="relative block size-[9px]">
              <span className="absolute top-1/2 left-0 h-[0.75px] w-full -translate-y-1/2 bg-white/87" />
              <span className="absolute top-0 left-1/2 h-full w-[0.75px] -translate-x-1/2 bg-white/87" />
            </span>
          </StepperButton>
        </div>
      </div>
    </div>
  );
}

function ResultToast({ result }: { result: { status: "won" | "lost"; delta: number } }) {
  const won = result.status === "won";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-8 left-1/2 z-[2] -translate-x-1/2 rounded-lg px-3 py-1.5",
        "text-[12px] leading-4 font-bold tabular-nums backdrop-blur-[9.64px]",
        won
          ? "bg-[rgb(63_208_139/0.18)] text-[#8CF0C0] shadow-[inset_0_0_0_1px_rgb(63_208_139/0.5)]"
          : "bg-[rgb(255_117_120/0.18)] text-[#FFC3C4] shadow-[inset_0_0_0_1px_rgb(255_117_120/0.5)]",
      )}
    >
      {won ? "Touched" : "Missed"} · {formatSigned(result.delta)} PTS
    </div>
  );
}

/** "Golden cube hidden on the board", as the live app teases it. */
function GoldenHint() {
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

function BrokeNotice({ onReset }: { onReset: () => void }) {
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

function HelpOverlay({ onClose }: { onClose: () => void }) {
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

function StepperButton({
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

function ControlButton({
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

// --- icons ------------------------------------------------------------------

const iconClass = "size-[15px] text-white/87";

function ResetIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={iconClass}
    >
      <path d="M13.4 8a5.4 5.4 0 1 1-1.6-3.8" />
      <path d="M12.6 2.2v2.9H9.7" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
      <rect x="4.4" y="3.4" width="2.5" height="9.2" rx="0.7" />
      <rect x="9.1" y="3.4" width="2.5" height="9.2" rx="0.7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className={iconClass}>
      <path d="M5.2 3.5a.6.6 0 0 1 .92-.51l6.3 4.0a.6.6 0 0 1 0 1.02l-6.3 4a.6.6 0 0 1-.92-.5V3.5Z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={iconClass}
    >
      <path d="M6.1 6a2 2 0 1 1 2.6 1.9c-.5.2-.8.6-.8 1.1v.4" />
      <circle cx="8" cy="11.8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TapIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill="none"
      stroke="#999999"
      strokeWidth="1"
      className="size-[10.5px]"
    >
      <path d="M4.6 6V2.4a1 1 0 0 1 2 0V6m0 0V4.9a.9.9 0 0 1 1.8 0V6m0 0a.9.9 0 0 1 1.8 0v2.1a2.4 2.4 0 0 1-2.4 2.4H6.1a2.4 2.4 0 0 1-2.1-1.2L2.6 7" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg aria-hidden viewBox="0 0 12 12" fill="#999999" className="size-[10.5px]">
      <path d="M6 .8c.4 1.7-.5 2.5-1.3 3.3C3.7 5 2.8 5.9 2.8 7.5a3.2 3.2 0 0 0 6.4 0c0-1.9-1.2-3-2-3.9.2 1-.3 1.6-.8 2 .1-1.4-.2-3.4-.4-4.8Z" />
    </svg>
  );
}

function BarIcon({ negative }: { negative: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      fill={negative ? "#FF7578" : "#3FD08B"}
      className="size-[10.5px]"
    >
      <rect x="1.4" y="6.4" width="2.4" height="4" rx="0.4" />
      <rect x="4.8" y="3.6" width="2.4" height="6.8" rx="0.4" />
      <rect x="8.2" y="1.6" width="2.4" height="8.8" rx="0.4" />
    </svg>
  );
}

function GripIcon() {
  return (
    <span
      aria-hidden
      className="grid size-[18px] grid-cols-2 place-content-center gap-x-[4.1px] gap-y-[2.7px] rounded-[3px]"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="size-[2.64px] rounded-[0.5px] bg-white/60" />
      ))}
    </span>
  );
}
