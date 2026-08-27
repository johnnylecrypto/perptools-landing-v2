import { render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PredictionBoard } from "@/components/sections/prediction-board";
import { STAKE_STEPS, SUBTICK_MS, SUBTICKS_PER_COLUMN, geometries } from "@/lib/prediction-engine";

/**
 * jsdom has neither of the browser APIs the board subscribes to, so both are
 * stubbed: a wide viewport (so the assertions run against the desktop board the
 * design specifies) with reduced motion off, and an observer that reports the
 * board on screen so the clock runs.
 */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("min-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );

  // The board subscribes to a live price feed. Tests must not reach the
  // network, and a feed that never delivers is also the real fallback path —
  // so these assert the board works on its simulated walk alone.
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  vi.stubGlobal(
    "WebSocket",
    class {
      onopen: (() => void) | null = null;
      onmessage: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onclose: (() => void) | null = null;
      close() {}
    },
  );

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {
        this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as never);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

/** The board's balance readout, e.g. "99.5 PTS". Points carry two decimals. */
function balance() {
  const text = screen.getByText(/PTS$/, { selector: "span.font-bold" }).textContent ?? "";
  return Number(text.replace(/,/g, "").replace(/[^0-9.]/g, ""));
}

/**
 * Controllable rAF. Honours cancellation, so a cancelled loop really does stop
 * — a no-op `cancelAnimationFrame` would let a stale callback keep running and
 * hide exactly the bug this is meant to catch.
 */
function frameHarness() {
  let nextId = 1;
  const pending = new Map<number, FrameRequestCallback>();

  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    pending.delete(id);
  });

  return {
    get scheduled() {
      return pending.size;
    },
    /** Run the frame that is currently queued, at `now`. */
    run(now: number) {
      const [id, cb] = [...pending.entries()].pop()!;
      pending.delete(id);
      act(() => cb(now));
    },
  };
}

/** Open cells only: a cell holding a bet keeps `data-cell` so taps can stack. */
function playableCells() {
  return screen
    .getAllByRole("button")
    .filter((el) => el.hasAttribute("data-cell") && !el.hasAttribute("data-bet"));
}

/**
 * A cell safely clear of the lock boundary.
 *
 * The leftmost playable column turns into a locked one as soon as the playhead
 * advances, and that swaps its `<button>` for a `<div>` — replacing the DOM node
 * mid-click if a test happens to be holding it.
 */
function safeCell() {
  const cells = playableCells();
  return cells[Math.floor(cells.length / 2)];
}

describe("PredictionBoard", () => {
  it("renders a playable grid with the desktop geometry", () => {
    render(<PredictionBoard />);
    const cells = playableCells();

    // Every column right of the locked band, across every row. The world is
    // laid out one column wider than the panel so it can scroll without a gap,
    // and that spare column is playable too — it scrolls into view shortly.
    const { columns, rows, nowColumn, lockAhead } = geometries.desktop;
    const playableColumns = columns + 1 - (nowColumn - 1) - lockAhead;
    expect(cells).toHaveLength(playableColumns * rows);
  });

  it("debits the stake and marks the cell when one is tapped", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    // Stop the clock first: a column scroll mid-click would retire one playable
    // column and reveal another, hiding the change this test is checking for.
    await user.click(screen.getByLabelText("Pause"));

    const before = balance();
    const cellsBefore = playableCells();
    const cell = safeCell();
    const stake = STAKE_STEPS[2]; // the opening preset

    await user.click(cell);

    expect(balance()).toBe(before - stake);
    // The tapped cell stops being playable and becomes a staked cell showing
    // the locked-in odds over the amount at risk.
    expect(cell).not.toBeInTheDocument();
    expect(playableCells()).toHaveLength(cellsBefore.length - 1);

    // The staked cell prints the potential payout (stake x odds, 2dp) rather
    // than the stake, as the live board does.
    const grid = screen.getByLabelText(/Prediction grid/);
    expect(within(grid).getByText(/^\d+\.\d{2}$/)).toBeInTheDocument();
  });

  it("stacks repeat taps on one cell instead of ignoring them", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);
    await user.click(screen.getByLabelText("Pause"));

    const before = balance();
    const cell = safeCell();
    const stake = STAKE_STEPS[2];

    await user.click(cell);
    const staked = playableCells();
    // Tapping the same coordinates again: the cell is now a bet cell, so find
    // it by position rather than by the button that used to be there.
    const grid = screen.getByLabelText(/Prediction grid/);
    const betCell = within(grid)
      .getByText(/^\d+\.\d{2}$/)
      .closest("div")!;
    await user.click(betCell);

    // Balance moved twice and no extra playable cell was consumed.
    expect(balance()).toBe(before - stake * 2);
    expect(playableCells()).toHaveLength(staked.length);
  });

  it("settles the bet as the playhead reaches it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<PredictionBoard />);

    const staked = balance();
    await user.click(safeCell());
    const afterBet = balance();
    expect(afterBet).toBeLessThan(staked);

    // Run past the bet's column. How far that is comes from the geometry — the
    // bet lands `lockAhead` columns out — rather than a hard-coded guess.
    const columns = geometries.desktop.lockAhead + 2;
    await act(async () => {
      vi.advanceTimersByTime(SUBTICK_MS * SUBTICKS_PER_COLUMN * columns);
    });

    const live = screen.getByRole("status", { hidden: true });
    expect(live.textContent).toMatch(/Won .* points|Missed\./);
  });

  it("slides the sheet on animation frames, without re-rendering the grid", () => {
    // Rendering 200-odd cells in jsdom takes longer than a sub-tick, so the
    // real clock would put every frame past the end of the interpolation.
    // Freeze `performance` (and the game's interval) and step it by hand.
    vi.useFakeTimers({ toFake: ["performance", "setInterval", "clearInterval"] });

    const frames = frameHarness();
    render(<PredictionBoard />);

    const grid = screen.getByLabelText(/Prediction grid/);
    const world = grid.parentElement!.parentElement!;
    const cellBefore = playableCells()[0];

    const read = () => Number(world.style.transform.replace(/[^0-9.]/g, ""));
    const start = read();

    vi.advanceTimersByTime(SUBTICK_MS * 0.3);
    frames.run(performance.now());
    const third = read();

    vi.advanceTimersByTime(SUBTICK_MS * 0.4);
    frames.run(performance.now());
    const twoThirds = read();

    // The sheet slides further left on each frame, in proportion to elapsed
    // time, and the grid underneath is the very same DOM node throughout.
    expect(third).toBeGreaterThan(start);
    expect(twoThirds).toBeGreaterThan(third);
    expect(twoThirds - third).toBeCloseTo(((third - start) * 4) / 3, 4);
    expect(playableCells()[0]).toBe(cellBefore);
  });

  it("stops the animation loop when paused", async () => {
    const frames = frameHarness();
    const user = userEvent.setup();
    render(<PredictionBoard />);
    expect(frames.scheduled).toBeGreaterThan(0);

    await user.click(screen.getByLabelText("Pause"));
    // The effect cleanup cancelled the pending frame and queued no replacement.
    expect(frames.scheduled).toBe(0);

    await user.click(screen.getByLabelText("Resume"));
    expect(frames.scheduled).toBeGreaterThan(0);
  });

  it("steps the stake up and down", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    const panel = screen.getByLabelText("Increase stake").closest("div")!;
    const readStake = () => within(panel).getByText(/^[0-9,.]+$/).textContent;

    const initial = readStake();
    await user.click(screen.getByLabelText("Increase stake"));
    expect(readStake()).not.toBe(initial);

    await user.click(screen.getByLabelText("Decrease stake"));
    expect(readStake()).toBe(initial);
  });

  it("pauses and resumes the clock", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    await user.click(screen.getByLabelText("Pause"));
    expect(screen.getByLabelText("Resume")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Resume"));
    expect(screen.getByLabelText("Pause")).toBeInTheDocument();
  });

  it("explains the mechanic behind the help control", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    await user.click(screen.getByLabelText("How it works"));
    expect(screen.getByText("How Tap Predictions works")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Got it" }));
    expect(screen.queryByText("How Tap Predictions works")).not.toBeInTheDocument();
  });

  it("switches market and restarts the session", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    await user.click(safeCell());
    const spent = balance();

    await user.click(screen.getByRole("button", { name: /ETH-PERP/ }));
    // A fresh ladder means a fresh session, so the balance is whole again.
    expect(balance()).toBeGreaterThan(spent);
  });

  it("resets the session", async () => {
    const user = userEvent.setup();
    render(<PredictionBoard />);

    const start = balance();
    await user.click(safeCell());
    expect(balance()).toBeLessThan(start);

    await user.click(screen.getByLabelText("Reset demo"));
    expect(balance()).toBe(start);
  });
});
