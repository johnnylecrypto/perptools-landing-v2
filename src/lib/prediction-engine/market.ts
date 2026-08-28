export type Market = {
  symbol: string;
  change: string;
  /** 12x12 coin mark. */
  logo: string;
  /** Binance symbol the live feed subscribes to, e.g. "BTCUSDT". */
  stream: string;
  /** Fallback level: what the server renders, and what a blocked feed uses. */
  price: number;
  /** Decimals shown on the price ladder. */
  decimals: number;
};

/**
 * Row height in dollars: 0.01% of price, the product's `PRICE_STEP_RATIO`.
 * One source of truth for cell shape, exactly as `getBasePriceStep` does it.
 */
export const PRICE_STEP_RATIO = 0.0001;

/**
 * The price ladder: the level it is centred on and the dollar height of a row.
 *
 * Derived from a live anchor rather than a fixed number, because the whole
 * ladder only spans `rows * 0.01%` of price — 0.16% over 16 rows — and a real
 * market walks out of that in under a minute.
 */
