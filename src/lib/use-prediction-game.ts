"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSyncExternalStore } from "react";
import {
  SUBTICK_MS,
  createGame,
  geometries,
  reducer,
  type GeometryName,
  type Market,
} from "@/lib/prediction-engine";
import { usePriceFeed } from "@/lib/price-feed";

/** Subscribes to a media query, SSR-safe. */
function useMediaQuery(query: string, serverValue: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * Board size for the current viewport.
 *
 * The server always renders the desktop board — the column count is data, not
 * CSS, so it cannot be resolved before hydration. The board sits well below the
 * fold, so the swap has long since happened by the time it is scrolled into
 * view.
 */
export function useGeometryName(): GeometryName {
  const isDesktop = useMediaQuery("(min-width: 1024px)", true);
  const isTablet = useMediaQuery("(min-width: 640px)", true);
  if (isDesktop) return "desktop";
  return isTablet ? "tablet" : "phone";
}

export function usePredictionGame(markets: readonly Market[]) {
  const [marketIndex, setMarketIndex] = useState(0);
  const market = markets[marketIndex];

  const geometryName = useGeometryName();
  const geometry = geometries[geometryName];

  const [onScreen, setOnScreen] = useState(false);
  // Sticky: `onScreen` flips every time the board crosses the observer's
  // threshold, and gating the socket on that tore it down and rebuilt it while
  // the visitor was still scrolling. Once seen, the feed stays connected.
  const [started, setStarted] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Real BTC/ETH/BNB quotes. `latest` is a ref, so a trade does not re-render
  // anything; the tick loop reads it once per sub-tick.
  const feed = usePriceFeed(market.stream, started);

  const [state, dispatch] = useReducer(reducer, undefined, () =>
    createGame(markets[0], geometries.desktop),
  );

  // Switching market or board size invalidates the ladder the prices were
  // generated against, so the session restarts rather than rescaling.
  const signature = `${geometryName}:${marketIndex}`;
  const lastSignature = useRef(`desktop:0`);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    dispatch({ type: "reset", market, geometry });
  }, [signature, market, geometry]);

  // Reduced motion opens paused: the board animates continuously, so it starts
  // still and waits to be started deliberately. Read as a subscription rather
  // than an effect that sets state, so there is no cascading first render.
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const [pauseOverride, setPauseOverride] = useState<boolean | null>(null);
  const paused = pauseOverride ?? reducedMotion;

  // The session begins when the board is scrolled to, and the clock stops again
  // when it leaves — so the chart a visitor sees always starts from the moment
  // they arrive at it rather than from whenever the page loaded.
  useEffect(() => {
    const node = boardRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      // No observer to tell us: just run. Deferred rather than set inline so
      // this is not a synchronous state update inside an effect.
      const id = window.setTimeout(() => {
        setOnScreen(true);
        setStarted(true);
      }, 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting) setStarted(true);
      },
      // A generous margin so approaching the board starts it, rather than the
      // threshold being crossed back and forth mid-scroll.
      { threshold: 0, rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // The first real quote re-seats the ladder around it; the seeded walk only
  // ever covers the gap before that, or a feed that never connects.
  const anchored = useRef(false);
  useEffect(() => {
    anchored.current = false;
  }, [signature]);

  const running = !paused && onScreen;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const quote = feed.latest.current;
      // Re-anchoring is done from here rather than from an effect watching the
      // price, so a trade never has to pass through React state to be seen.
      if (!anchored.current && quote !== null) {
        anchored.current = true;
        dispatch({ type: "anchor", market, geometry, price: quote });
        return;
      }
      dispatch({ type: "tick", market, geometry, quote });
    }, SUBTICK_MS);
    return () => window.clearInterval(id);
  }, [running, market, geometry, feed.latest]);

  // Clear the settlement toast a beat after it lands.
  useEffect(() => {
    if (!state.result) return;
    const id = window.setTimeout(() => dispatch({ type: "dismissResult" }), 2200);
    return () => window.clearTimeout(id);
  }, [state.result]);

  const actions = useMemo(
    () => ({
      bet: (row: number, column: number) =>
        dispatch({ type: "bet", row, column, market, geometry }),
      changeStake: (direction: 1 | -1) => dispatch({ type: "stake", direction }),
      reset: () => dispatch({ type: "reset", market, geometry }),
      togglePaused: () => setPauseOverride((value) => !(value ?? reducedMotion)),
      selectMarket: setMarketIndex,
    }),
    [market, geometry, reducedMotion],
  );

  return {
    state,
    market,
    marketIndex,
    geometry,
    geometryName,
    paused,
    running,
    feedStatus: feed.status,
    boardRef,
    actions,
  };
}
