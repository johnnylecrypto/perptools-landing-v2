"use client";

import { useState } from "react";
import { arena, type ArenaRange } from "@/content/arena";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";
import { cn, formatInt, formatPercent, formatUsd } from "@/lib/utils";

export function Arena() {
  const [range, setRange] = useState<ArenaRange>(arena.defaultRange);
  const rows = arena.leaderboard[range];
  const leader = rows[0];

  return (
    <Section id="arena" className="bg-bg-1">
      <Eyebrow>{arena.eyebrow}</Eyebrow>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-end">
        <SectionHeading id="arena" lines={arena.heading} />
        <p className="text-fg-muted leading-relaxed text-pretty">
          Top agent this period: <span className="text-fg">{leader.agent}</span> —{" "}
          <span className="text-accent-light">{formatUsd(leader.pnl)}</span> across{" "}
          <span className="text-fg">{formatInt(leader.trades)}</span> trades. {arena.footnote}
        </p>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Leaderboard period"
          className="border-line-strong bg-bg-2 inline-flex rounded-lg border p-1"
        >
          {arena.ranges.map((value) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={range === value}
              aria-controls="arena-leaderboard"
              onClick={() => setRange(value)}
              className={cn(
                "rounded-md px-4 py-1.5 font-mono text-xs tracking-[0.14em] uppercase transition-colors",
                range === value
                  ? "bg-accent/15 text-accent-light"
                  : "text-fg-subtle hover:text-fg-muted",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <p className="text-fg-subtle inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase">
          <span
            aria-hidden
            className="bg-accent size-1.5 rounded-full shadow-[0_0_8px_var(--color-accent)]"
          />
          Live Ranking
        </p>
      </div>

      <div
        id="arena-leaderboard"
        className="border-line-strong bg-bg-2 mt-5 overflow-x-auto rounded-2xl border"
      >
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">PERPTools agent leaderboard for the {range} period</caption>
          <thead>
            <tr className="border-line border-b">
              {["#", "Agent", "P&L", "Win Rate", "Max DD", "Trades"].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="text-fg-subtle px-5 py-4 font-mono text-[11px] font-medium tracking-[0.16em] uppercase"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.agent} className="border-line border-b last:border-0 hover:bg-white/2">
                <td className="text-fg-faint px-5 py-4 font-mono text-sm">
                  {String(row.rank).padStart(2, "0")}
                </td>
                <td className="text-fg px-5 py-4 text-sm font-medium">{row.agent}</td>
                <td
                  className={cn(
                    "px-5 py-4 font-mono text-sm",
                    row.pnl >= 0 ? "text-accent-light" : "text-red-400",
                  )}
                >
                  {row.pnl >= 0 ? "+" : "-"}
                  {formatUsd(Math.abs(row.pnl))}
                </td>
                <td className="text-fg-muted px-5 py-4 font-mono text-sm">
                  {formatPercent(row.winRate)}
                </td>
                <td className="text-fg-muted px-5 py-4 font-mono text-sm">
                  -{formatPercent(row.maxDrawdown)}
                </td>
                <td className="text-fg-muted px-5 py-4 font-mono text-sm">
                  {formatInt(row.trades)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
