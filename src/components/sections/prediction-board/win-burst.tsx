import type { CSSProperties } from "react";

/**
 * Win celebration for a cell that got touched, anchored to that cell.
 *
 * Everything is sized in percentages of the cell rather than the Figma frame's
 * pixels: the board picks its own cell size per breakpoint, so a 120px ring
 * would swamp a phone and get lost on a desktop. The frame's 120/72/32px
 * circles against a ~40px cell are what set the 300/180/80% below.
 *
 * Geometry is a fixed table, not `Math.random()` — the server and the client
 * have to produce the same markup, and a burst is only convincing if it is the
 * same burst every time it fires on the same cell.
 */

const SPARKS = [
  { spin: "0deg", throw: "150%" },
  { spin: "72deg", throw: "185%" },
  { spin: "144deg", throw: "160%" },
  { spin: "216deg", throw: "195%" },
  { spin: "288deg", throw: "170%" },
];

const PARTICLE_COLORS = [
  "var(--color-success-bright)",
  "var(--color-warning)",
  "var(--color-accent)",
];

/**
 * 14 particles on a golden-angle spiral. Even angular steps read as a clock
 * face; the irrational step keeps the spray looking thrown.
 */
const PARTICLES = Array.from({ length: 14 }, (_, index) => {
  const angle = index * 137.508 * (Math.PI / 180);
  const distance = 150 + (index % 4) * 26;
  return {
    tx: `${(Math.cos(angle) * distance).toFixed(1)}%`,
    ty: `${(Math.sin(angle) * distance).toFixed(1)}%`,
    size: [3, 5, 7][index % 3],
    color: PARTICLE_COLORS[index % 3],
    delay: `${(index % 5) * 18}ms`,
  };
});

const CHIPS = [
  { label: "+120", peak: 0.7, delay: "90ms" },
  { label: "+80", peak: 0.45, delay: "180ms" },
];

export function WinBurst({ payout }: { payout: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3] motion-reduce:hidden"
      data-win-burst="true"
    >
      <span className="absolute top-1/2 left-1/2 block size-full -translate-1/2">
        <span className="animate-burst-ring border-success-bright absolute top-1/2 left-1/2 block size-[300%] -translate-1/2 rounded-full border shadow-[0_0_18px_4px_--alpha(var(--color-success-bright)/45%)]" />
        <span
          style={{ animationDelay: "60ms" }}
          className="animate-burst-ring border-success-bright/60 absolute top-1/2 left-1/2 block size-[180%] -translate-1/2 rounded-full border shadow-[0_0_10px_2px_--alpha(var(--color-success-bright)/55%)]"
        />
        <span className="animate-burst-ring absolute top-1/2 left-1/2 block size-[80%] -translate-1/2 rounded-full bg-[radial-gradient(circle,--alpha(var(--color-success-bright)/90%)_0%,transparent_70%)] shadow-[0_0_14px_3px_--alpha(var(--color-success-bright)/60%)]" />

        {SPARKS.map((spark) => (
          <span
            key={spark.spin}
            style={{ "--spin": spark.spin, "--throw": spark.throw } as CSSProperties}
            className="animate-burst-spark bg-warning/55 absolute top-1/2 left-1/2 block h-[35%] w-[2px] rounded-[1px] shadow-[0_0_3px_--alpha(var(--color-success-bright)/50%)]"
          />
        ))}

        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            style={
              {
                "--tx": particle.tx,
                "--ty": particle.ty,
                width: particle.size,
                height: particle.size,
                background: particle.color,
                animationDelay: particle.delay,
                boxShadow: `0 0 4px ${particle.color}`,
              } as CSSProperties
            }
            className="animate-burst-particle absolute top-1/2 left-1/2 block rounded-full"
          />
        ))}
      </span>

      {CHIPS.map((chip) => (
        <span
          key={chip.label}
          style={{ "--chip-peak": chip.peak, animationDelay: chip.delay } as CSSProperties}
          className="animate-burst-chip border-success-bright/40 text-warning absolute -top-4 left-1/2 rounded-full border bg-[--alpha(var(--color-success-deep)/65%)] px-2 py-[2px] text-[9px] leading-none font-bold opacity-0"
        >
          {chip.label}
        </span>
      ))}

      <span className="animate-score-rise text-success-light absolute -top-2 left-1/2 text-[15px] leading-none font-extrabold whitespace-nowrap [text-shadow:0_0_10px_--alpha(var(--color-success-bright)/60%)]">
        + {payout}
      </span>
    </span>
  );
}
