"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live spot price for one symbol, from Binance's public market data.
 *
 * No key and no account: the REST call seeds a price immediately so the board
 * has a real level on the first frame, then the trade stream keeps it current.
 *
 * The board must keep working when this cannot connect — Binance is blocked in
 * some regions and blocked by some networks — so failure is reported rather
 * than thrown, and the caller falls back to its simulated walk.
 */
export type FeedStatus = "connecting" | "live" | "offline";

const REST = "https://api.binance.com/api/v3/ticker/price";
const STREAM = "wss://stream.binance.com:9443/ws";

/** Give up on a silent socket; trades on these pairs are never this sparse. */
const STALE_MS = 20_000;
const RECONNECT_MS = 4_000;

export function usePriceFeed(symbol: string, enabled: boolean) {
  /**
   * Only the *status* is React state, and it changes just a handful of times a
   * session. The price itself never is: BTCUSDT prints dozens of trades a
   * second, and putting those through `setState` re-rendered the whole board
   * that often, which is what made it stutter and flash.
   */
  const [feed, setFeed] = useState<{ symbol: string; status: FeedStatus }>({
    symbol,
    status: "connecting",
  });
  // The tick loop reads this instead, once per sub-tick.
  const latest = useRef<number | null>(null);

  useEffect(() => {
    // Nothing is opened until the caller says the board is actually in view, so
    // a visitor who never scrolls this far never opens a socket.
    if (!enabled) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnect: number | undefined;
    let watchdog: number | undefined;

    latest.current = null;

    const setStatus = (status: FeedStatus) => {
      // Transitions only; a repeat is not a render.
      setFeed((current) =>
        current.symbol === symbol && current.status === status ? current : { symbol, status },
      );
    };

    const publish = (value: number) => {
      if (cancelled || !Number.isFinite(value) || value <= 0) return;
      latest.current = value;
      setStatus("live");
    };

    const goOffline = () => {
      if (!cancelled && latest.current === null) setStatus("offline");
    };

    const armWatchdog = () => {
      window.clearTimeout(watchdog);
      watchdog = window.setTimeout(() => {
        if (!cancelled) socket?.close();
      }, STALE_MS);
    };

    // Seed from REST so the ladder can anchor before the first trade lands.
    fetch(`${REST}?symbol=${symbol.toUpperCase()}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data: { price?: string }) => publish(Number(data.price)))
      .catch(goOffline);

    const connect = () => {
      if (cancelled) return;
      try {
        socket = new WebSocket(`${STREAM}/${symbol.toLowerCase()}@trade`);
      } catch {
        goOffline();
        return;
      }

      socket.onopen = armWatchdog;
      socket.onmessage = (event) => {
        try {
          const trade = JSON.parse(event.data as string) as { p?: string };
          publish(Number(trade.p));
          armWatchdog();
        } catch {
          // A malformed frame is not worth tearing the connection down for.
        }
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (cancelled) return;
        window.clearTimeout(watchdog);
        goOffline();
        reconnect = window.setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnect);
      window.clearTimeout(watchdog);
      if (socket) {
        // Drop the handlers first: closing fires `onclose`, which would
        // otherwise queue a reconnect for a symbol we have already left.
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      }
    };
  }, [symbol, enabled]);

  // A stale entry means the symbol just changed and this render is ahead of
  // the effect; report it as connecting rather than as the previous market.
  const status: FeedStatus = feed.symbol === symbol ? feed.status : "connecting";
  return { status, latest };
}
