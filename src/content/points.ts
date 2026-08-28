import type { Market } from "@/lib/prediction-engine";

export const points = {
  heading: "Put your Points to work.",
  lede: "Pick a price band, set a stake, tap. If price touches the band before the window closes, the multiplier pays. Try it right here — no wallet needed.",
  /**
   * Markets mirror the live product's `SUPPORTED_TOKENS`. `stream` is the pair
   * the board subscribes to for real quotes; `price` is only the fallback the
   * server renders and what a blocked feed falls back to, so it does not need
   * to be current. Row height comes off the live price at the product's
   * `PRICE_STEP_RATIO` (0.01%), so the grid keeps the shape it has there.
   */
  markets: [
    {
      symbol: "BTC-PERP",
      change: "+3.48%",
      logo: "/tokens/btc.png",
      stream: "BTCUSDT",
      price: 81000,
      decimals: 1,
    },
    {
      symbol: "ETH-PERP",
      change: "+2.90%",
      logo: "/tokens/eth.png",
      stream: "ETHUSDT",
      price: 2300,
      decimals: 2,
    },
    {
      symbol: "BNB-PERP",
      change: "+3.43%",
      logo: "/tokens/bnb.png",
      stream: "BNBUSDT",
      price: 650,
      decimals: 3,
    },
  ] satisfies Market[],
  /** Shown under the board so nobody mistakes the demo for the live product. */
  disclaimer: "Simulated market and points. Nothing here touches a wallet or real funds.",
  help: {
    title: "How Tap Predictions works",
    steps: [
      "Every cell is a price band (row) inside a time window (column).",
      "Set your stake, then tap any cell right of the NOW line.",
      "Bands far from spot pay a bigger multiplier — and are far harder to touch.",
      "When the playhead reaches your cell, you win as soon as price touches that band.",
    ],
  },
} as const;
