import { describe, expect, it } from "vitest";
import {
  SUBTICKS_PER_COLUMN,
  GOLDEN_CELL,
  LOST_VISIBLE_SUBTICKS,
  STAKE_STEPS,
  STARTING_BALANCE,
  WIN_VISIBLE_SUBTICKS,
  type GameState,
  type Market,
  bandFor,
  clampToLadder,
  createGame,
  currentColumn,
  didTouch,
  firstPlayableColumn,
  firstVisibleColumn,
  applyGolden,
  ladderOf,
  formatMultiplier,
  goldenRowFor,
  isGoldenCell,
  geometries,
  multiplierFor,
  priceToFraction,
  sigmaOf,
  reducer,
  roundPoints,
  rowOf,
  rowForPrice,
  stepRng,
  timeLabel,
} from "@/lib/prediction-engine";

const market: Market = {
  symbol: "TEST-PERP",
  change: "+0.00%",
  logo: "/logo-btc.png",
  stream: "BTCUSDT",
  price: 81000,
  decimals: 1,
};

/** The ladder a fresh game sits on: anchored at the market's fallback level. */
const ladder = ladderOf(market.price);

/** Sigma in the range the simulated walk actually produces. */
const SIGMA = 5e-5;

/** Price a cell `columnsAhead` out, at spot. */
const priceAt = (row: number, columnsAhead: number, price = market.price) =>
  multiplierFor(row, columnsAhead, price, SIGMA, ladder, rows);

const geometry = geometries.desktop;
const rows = geometry.rows;

/** Advance the game `count` sub-ticks. */
function run(state: GameState, count: number) {
  let next = state;
  for (let i = 0; i < count; i += 1)
    next = reducer(next, { type: "tick", market, geometry, quote: null });
  return next;
}

/**
 * Advance to the exact sub-tick `column` settles on, and no further.
 *
 * Settled bets are cleared on their own clock, so over-running drops them
 * before they can be inspected — which is a property worth not tripping over.
 */
function runUntilSettled(state: GameState, column: number) {
  const target = (column + 1) * SUBTICKS_PER_COLUMN;
  return run(state, Math.max(0, target - state.subtick));
}

describe("stepRng", () => {
  it("is deterministic and stays in [0, 1)", () => {
    let seed = 1234;
    const values: number[] = [];
    for (let i = 0; i < 200; i += 1) {
      const step = stepRng(seed);
      seed = step.seed;
      values.push(step.value);
    }

    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
    // Same seed, same sequence — this is what keeps SSR and hydration in sync.
    expect(stepRng(1234).value).toBe(values[0]);
    // And it does not collapse to a constant.
    expect(new Set(values).size).toBeGreaterThan(190);
  });
});

describe("price <-> row mapping", () => {
  it("puts the anchor price on the middle row of the ladder", () => {
    expect(rowForPrice(market.price, ladder, rows)).toBe(Math.floor(rows / 2));
  });

  it("maps a price inside a band back to that band", () => {
    for (let row = 0; row < rows; row += 1) {
      const { high, low } = bandFor(row, ladder, rows);
      const middle = (high + low) / 2;
      expect(rowForPrice(middle, ladder, rows)).toBe(row);
    }
  });

  it("clamps prices beyond the ladder onto it", () => {
    expect(rowForPrice(1e9, ladder, rows)).toBe(0);
    expect(rowForPrice(1, ladder, rows)).toBe(rows - 1);
  });

  it("keeps the walk on the ladder", () => {
    const clampedHigh = clampToLadder(99_999, ladder, rows);
    const clampedLow = clampToLadder(-99_999, ladder, rows);
    expect(priceToFraction(clampedHigh, ladder, rows)).toBeLessThanOrEqual(1);
    expect(priceToFraction(clampedLow, ladder, rows)).toBeGreaterThanOrEqual(0);
  });
});

describe("multiplierFor (product pricer)", () => {
  const spotRow = rowForPrice(market.price, ladder, rows);
  // Sit spot in the middle of its band: exactly on a boundary the neighbouring
  // row is equally reachable, so the curve is legitimately flat there.
  const spot = (bandFor(spotRow, ladder, rows).high + bandFor(spotRow, ladder, rows).low) / 2;

  it("pays least at spot and more the further the band sits from it", () => {
    let previous = priceAt(spotRow, 5, spot);
    for (let offset = 1; offset + spotRow < rows; offset += 1) {
      const current = priceAt(spotRow + offset, 5, spot);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  // Time cuts both ways, and the board shows both regimes side by side.
  it("makes a band at spot pay more the further out the window sits", () => {
    // A band is a narrow slice. Further out, the distribution of where price
    // could be is wider, so sitting in that exact slice gets less likely.
    let previous = priceAt(spotRow, 5, spot);
    for (const ahead of [8, 11, 14, 17, 20]) {
      const current = priceAt(spotRow, ahead, spot);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });

  it("makes a distant band pay less the further out the window sits", () => {
    // Far from spot the opposite dominates: more time means more chance of
    // travelling far enough to touch at all.
    let previous = priceAt(spotRow + 5, 5, spot);
    for (const ahead of [8, 11, 14, 17, 20]) {
      const current = priceAt(spotRow + 5, ahead, spot);
      expect(current).toBeLessThan(previous);
      previous = current;
    }
  });

  it("spreads far bands well above near ones on a playable column", () => {
    // Sanity on the numbers a player actually sees in the first open column.
    expect(priceAt(spotRow, 5, spot)).toBeLessThan(1.5);
    expect(priceAt(spotRow + 5, 5, spot)).toBeGreaterThan(5);
  });

  it("stays inside the product's multiplier clamp", () => {
    for (let row = 0; row < rows; row += 1) {
      for (const ahead of [5, 10, 20]) {
        const multiplier = priceAt(row, ahead);
        expect(multiplier).toBeGreaterThanOrEqual(1.01);
        expect(multiplier).toBeLessThanOrEqual(25);
      }
    }
  });

  it("prints one decimal and an x, as the live board does", () => {
    expect(formatMultiplier(25)).toBe("25.0x");
    expect(formatMultiplier(1.01)).toBe("1.0x");
    expect(formatMultiplier(3.456)).toBe("3.5x");
  });
});

describe("didTouch", () => {
  const { high, low } = bandFor(3, ladder, rows);
  const inside = (high + low) / 2;
  const above = high + ladder.band;
  const below = low - ladder.band;

  /** Build a price array where column 1's samples are `samples`. */
  function column1(samples: number[]) {
    const prices = new Array(SUBTICKS_PER_COLUMN).fill(above);
    return [...prices, ...samples];
  }

  it("detects a sample resting inside the band", () => {
    const prices = column1([above, inside, above, above]);
    expect(didTouch(prices, 1, low, high)).toBe(true);
  });

  it("detects a sweep straight through the band between samples", () => {
    // No sample lands inside, but the segment crosses it end to end.
    const prices = column1([above, below, above, above]);
    expect(didTouch(prices, 1, low, high)).toBe(true);
  });

  it("returns false when the price stays clear of the band", () => {
    const prices = column1([above, above, above, above]);
    expect(didTouch(prices, 1, low, high)).toBe(false);
  });
});

describe("game lifecycle", () => {
  it("opens with no history at all", () => {
    const start = createGame(market, geometry);
    // A single sample at the anchor. Nothing is pre-generated: the chart is
    // built from real time from the moment the session starts.
    expect(start.prices).toEqual([market.price]);
    expect(start.subtick).toBe(0);
    expect(start.live).toBe(false);
    expect(start.balance).toBe(STARTING_BALANCE);
  });

  it("keeps the playhead on its column with the history still empty", () => {
    const start = createGame(market, geometry);
    // The playhead stays at visible index nowColumn - 1; the columns behind it
    // are simply before the session began, so they read as empty grid.
    expect(currentColumn(start) - firstVisibleColumn(start, geometry)).toBe(geometry.nowColumn - 1);
  });

  it("fills the chart quarter after nowColumn columns of real time", () => {
    let state = createGame(market, geometry);
    state = run(state, geometry.nowColumn * SUBTICKS_PER_COLUMN);
    // The oldest sample has reached the left edge of the board.
    expect(firstVisibleColumn(state, geometry)).toBeGreaterThanOrEqual(0);
    expect(state.prices.length).toBeGreaterThan(geometry.nowColumn * SUBTICKS_PER_COLUMN);
  });

  it("advances exactly one column every SUBTICKS_PER_COLUMN ticks", () => {
    let state = createGame(market, geometry);
    for (let i = 0; i < 5; i += 1) {
      const before = currentColumn(state);
      state = run(state, SUBTICKS_PER_COLUMN);
      expect(currentColumn(state)).toBe(before + 1);
    }
  });

  it("debits the stake when a bet is placed", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);
    const next = reducer(start, { type: "bet", row: 2, column, market, geometry });

    expect(next.balance).toBe(roundPoints(start.balance - start.stake));
    expect(next.taps).toBe(1);
    expect(next.bets).toHaveLength(1);
    expect(next.bets[0]).toMatchObject({ column, status: "pending" });
    // The bet holds a dollar band, and it is the one row 2 covers.
    expect(rowOf(next.bets[0], ladder, rows)).toBe(2);
    expect(next.bets[0].priceLow).toBe(bandFor(2, ladder, rows).low);
  });

  it("locks columns at or before the playhead", () => {
    const start = createGame(market, geometry);
    const locked = firstPlayableColumn(start, geometry) - 1;
    const next = reducer(start, { type: "bet", row: 2, column: locked, market, geometry });
    expect(next).toBe(start);
  });

  it("stacks a second tap onto the same cell instead of rejecting it", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);
    // A row the golden cube is not on, so the rates are the plain ones.
    const row = [0, 1, 2, 3].find((r) => !isGoldenCell(r, column, rows))!;

    const once = reducer(start, { type: "bet", row, column, market, geometry });
    const twice = reducer(once, { type: "bet", row, column, market, geometry });

    expect(twice.bets).toHaveLength(1);
    const bet = twice.bets[0];
    expect(bet.betCount).toBe(2);
    expect(bet.stake).toBe(roundPoints(once.bets[0].stake + start.stake));
    expect(twice.taps).toBe(2);
    expect(twice.balance).toBe(roundPoints(start.balance - bet.stake));
  });

  it("stake-weights the rate when taps stack at different odds", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry) + 3;
    const row = [0, 1, 2, 3].find((r) => !isGoldenCell(r, column, rows))!;

    const first = reducer(start, { type: "bet", row, column, market, geometry });
    const a = first.bets[0];

    // Let a column go by and raise the stake, so the second tap prices the same
    // cell at a different rate *and* carries a different weight.
    const later = reducer(run(first, SUBTICKS_PER_COLUMN), { type: "stake", direction: 1 });
    const rateNow = multiplierFor(
      row,
      column - currentColumn(later),
      later.prices[later.prices.length - 1],
      sigmaOf(later),
      ladder,
      rows,
    );
    expect(rateNow).not.toBeCloseTo(a.multiplier, 4);

    const merged = reducer(later, { type: "bet", row, column, market, geometry }).bets[0];

    expect(merged.betCount).toBe(2);
    expect(merged.stake).toBe(roundPoints(a.stake + later.stake));
    expect(merged.multiplier).toBeCloseTo(
      (a.stake * a.multiplier + later.stake * rateNow) / (a.stake + later.stake),
      6,
    );
    // The blend sits between the two rates it came from.
    const [lo, hi] = [a.multiplier, rateNow].sort((x, y) => x - y);
    expect(merged.multiplier).toBeGreaterThan(lo);
    expect(merged.multiplier).toBeLessThan(hi);
  });

  it("refuses a bet the balance cannot cover", () => {
    const start = { ...createGame(market, geometry), balance: 0 };
    const column = firstPlayableColumn(start, geometry);
    const next = reducer(start, { type: "bet", row: 2, column, market, geometry });
    expect(next).toBe(start);
  });

  it("settles a bet once the playhead passes its column, exactly once", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);
    const placed = reducer(start, { type: "bet", row: 4, column, market, geometry });

    const settled = runUntilSettled(placed, column);

    const bet = settled.bets.find((entry) => entry.id === placed.bets[0].id);
    expect(bet).toBeDefined();
    expect(bet!.status).not.toBe("pending");

    const stake = placed.bets[0].stake;
    expect(settled.balance).toBe(roundPoints(start.balance - stake + bet!.payout));
    expect(settled.pnl).toBe(roundPoints(bet!.payout - stake));

    // Running on must not settle it a second time.
    const later = run(settled, SUBTICKS_PER_COLUMN * 2);
    expect(later.pnl).toBe(settled.pnl);
    expect(later.balance).toBe(settled.balance);
  });

  it("pays stake x multiplier on a win and nothing on a miss", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);

    // Bet every row in one column: exactly one of them must contain the price.
    let state = start;
    for (let row = 0; row < rows; row += 1) {
      state = reducer(state, { type: "bet", row, column, market, geometry });
    }
    const staked = state.bets.reduce((total, bet) => total + bet.stake, 0);
    expect(state.balance).toBe(roundPoints(STARTING_BALANCE - staked));

    const settled = runUntilSettled(state, column);
    const done = settled.bets.filter((bet) => bet.status !== "pending");

    expect(done.length).toBe(rows);
    const won = done.filter((bet) => bet.status === "won");
    // The price is always somewhere on the ladder, so at least one band pays.
    expect(won.length).toBeGreaterThanOrEqual(1);
    for (const bet of won) expect(bet.payout).toBe(roundPoints(bet.stake * bet.multiplier));
    for (const bet of done.filter((entry) => entry.status === "lost")) {
      expect(bet.payout).toBe(0);
    }
  });

  it("walks the stake through its presets without running off either end", () => {
    let state = createGame(market, geometry);
    for (let i = 0; i < 20; i += 1) state = reducer(state, { type: "stake", direction: 1 });
    expect(state.stake).toBe(STAKE_STEPS[STAKE_STEPS.length - 1]);

    for (let i = 0; i < 40; i += 1) state = reducer(state, { type: "stake", direction: -1 });
    expect(state.stake).toBe(STAKE_STEPS[0]);
  });

  it("keeps the bet list from growing without bound", () => {
    let state = createGame(market, geometry);
    for (let i = 0; i < 40; i += 1) {
      const column = firstPlayableColumn(state, geometry);
      state = reducer(state, { type: "bet", row: i % rows, column, market, geometry });
      state = run(state, SUBTICKS_PER_COLUMN);
    }
    expect(state.bets.length).toBeLessThanOrEqual(geometry.columns);
  });

  it("resets back to a fresh session", () => {
    const start = createGame(market, geometry);
    const played = run(
      reducer(start, {
        type: "bet",
        row: 1,
        column: firstPlayableColumn(start, geometry),
        market,
        geometry,
      }),
      40,
    );
    const reset = reducer(played, { type: "reset", market, geometry });
    expect(reset).toEqual(start);
  });
});

describe("every geometry is playable", () => {
  it.each(Object.entries(geometries))("%s", (_name, entry) => {
    // There must be room to bet after the locked columns.
    expect(entry.nowColumn + entry.lockAhead).toBeLessThan(entry.columns);
    const state = createGame(market, entry);
    expect(state.prices).toHaveLength(1);

    const column = firstPlayableColumn(state, entry);
    const next = reducer(state, { type: "bet", row: 0, column, market, geometry: entry });
    expect(next.bets).toHaveLength(1);
  });
});

describe("golden cells", () => {
  it("is a pure function of the column, so it never drifts between renders", () => {
    for (let column = 0; column < 200; column += 1) {
      expect(goldenRowFor(column, rows)).toBe(goldenRowFor(column, rows));
    }
  });

  it("puts at most one golden cell in a column, and does so sometimes", () => {
    let golden = 0;
    for (let column = 0; column < 300; column += 1) {
      const row = goldenRowFor(column, rows);
      if (row === null) continue;
      golden += 1;
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(rows);
      // Exactly that one row reports golden.
      const flagged = Array.from({ length: rows }, (_, r) => isGoldenCell(r, column, rows));
      expect(flagged.filter(Boolean)).toHaveLength(1);
    }
    expect(golden).toBeGreaterThan(10);
    expect(golden).toBeLessThan(150);
  });

  it("doubles the rate, capped, and never pays less than the base", () => {
    expect(applyGolden(3)).toBe(6);
    expect(applyGolden(10)).toBe(GOLDEN_CELL.maxMultiplier);
    // Above the cap the base already wins, so the bonus must not cut it.
    expect(applyGolden(20)).toBe(20);
  });

  it("pays the golden rate on a bet placed there", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);
    const goldenRow = goldenRowFor(column, rows);
    if (goldenRow === null) return;

    const plain = [0, 1, 2, 3, 4].find((r) => r !== goldenRow)!;
    const onGolden = reducer(start, { type: "bet", row: goldenRow, column, market, geometry });
    const onPlain = reducer(start, { type: "bet", row: plain, column, market, geometry });

    expect(onGolden.bets[0].golden).toBe(true);
    expect(onPlain.bets[0].golden).toBe(false);
  });
});

describe("settled bets", () => {
  it("stamps the settling sub-tick and clears on the product's schedule", () => {
    const start = createGame(market, geometry);
    const column = firstPlayableColumn(start, geometry);
    const placed = reducer(start, { type: "bet", row: 4, column, market, geometry });

    const settled = runUntilSettled(placed, column);
    const bet = settled.bets.find((entry) => entry.id === placed.bets[0].id)!;
    // It settles on the first sub-tick past its column, not at the end of it.
    expect(bet.resolvedAt).not.toBeNull();
    expect(bet.resolvedAt!).toBeLessThanOrEqual(settled.subtick);
    expect(bet.resolvedAt!).toBeGreaterThan(placed.subtick);

    const life = bet.status === "won" ? WIN_VISIBLE_SUBTICKS : LOST_VISIBLE_SUBTICKS;
    const remaining = life - (settled.subtick - bet.resolvedAt!);
    // Still on the board right up to its last sub-tick, gone the one after.
    expect(run(settled, remaining).bets.some((entry) => entry.id === bet.id)).toBe(true);
    expect(run(settled, remaining + 1).bets.some((entry) => entry.id === bet.id)).toBe(false);
  });
});

describe("timeLabel", () => {
  it("signs the offset and marks the playhead as zero", () => {
    // One column is SECONDS_PER_COLUMN (3s), matching the product's default.
    expect(timeLabel(0)).toBe("+0s");
    expect(timeLabel(2)).toBe("+6s");
    expect(timeLabel(-3)).toBe("-9s");
  });
});
