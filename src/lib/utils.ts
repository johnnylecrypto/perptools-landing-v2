import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compact number formatting.
 *
 * Deliberately hand-rolled rather than `Intl.NumberFormat({notation:"compact"})`:
 * Node's ICU and the browser's disagree on rounding, which produced a
 * server/client hydration mismatch on the Arena leaderboard.
 */
export function formatCompact(value: number) {
  const units = [
    { threshold: 1e9, suffix: "B" },
    { threshold: 1e6, suffix: "M" },
    { threshold: 1e3, suffix: "K" },
  ];

  const abs = Math.abs(value);
  const unit = units.find((candidate) => abs >= candidate.threshold);
  if (!unit) return trimZero(value.toFixed(abs < 10 && !Number.isInteger(value) ? 1 : 0));

  return `${trimZero((value / unit.threshold).toFixed(1))}${unit.suffix}`;
}

function trimZero(value: string) {
  return value.replace(/\.0$/, "");
}

/** Thousands separators without relying on locale data. */
export function formatInt(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatUsd(value: number) {
  return `$${formatCompact(value)}`;
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`;
}
