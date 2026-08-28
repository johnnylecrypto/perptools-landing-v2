import { SECONDS_PER_COLUMN } from "./constants";

/** Fixed locale so server and client markup match. */
const priceFormatters = new Map<number, Intl.NumberFormat>();

export function formatPrice(value: number, decimals: number) {
  let formatter = priceFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    priceFormatters.set(decimals, formatter);
  }
  return `$${formatter.format(value)}`;
}

/** Points carry two decimals; stakes start at 0.1. */
export function roundPoints(value: number) {
  return Math.round(value * 100) / 100;
}

const pointsFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPoints(value: number) {
  return pointsFormatter.format(roundPoints(value));
}

export function formatSigned(value: number) {
  return `${value >= 0 ? "+" : "-"}${formatPoints(Math.abs(value))}`;
}

/** Time-axis label for a visible column offset from the playhead. */
export function timeLabel(offsetColumns: number) {
  const seconds = offsetColumns * SECONDS_PER_COLUMN;
  return `${seconds >= 0 ? "+" : ""}${seconds}s`;
}
