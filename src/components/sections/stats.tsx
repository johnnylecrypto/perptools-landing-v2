"use client";

import { useEffect, useState } from "react";
import { stats, type Stat } from "@/content/stats";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Section, SectionHeading } from "@/components/ui/section";
import { useInView } from "@/lib/use-in-view";

export function Stats() {
  return (
    <Section id="stats">
      <Eyebrow>{stats.eyebrow}</Eyebrow>
      <SectionHeading id="stats" lines={stats.heading} className="mt-6" />
      <p className="text-fg-muted mt-6 max-w-2xl leading-relaxed text-pretty">{stats.lede}</p>

      <dl className="border-line-strong bg-line-strong mt-14 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
        {stats.items.map((item) => (
          <StatCell key={item.label} stat={item} />
        ))}
      </dl>
    </Section>
  );
}

function StatCell({ stat }: { stat: Stat }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const value = useCountUp(stat.value, inView);
  const decimals = stat.decimals ?? 0;

  return (
    <div ref={ref} className="bg-bg-1 p-8">
      <dd className="text-fg font-mono text-[clamp(32px,4vw,44px)] font-semibold tracking-[-0.02em]">
        {stat.prefix}
        {value.toFixed(decimals)}
        {stat.suffix ? <span className="text-accent ml-1">{stat.suffix}</span> : null}
      </dd>
      <dt className="text-fg-subtle mt-3 font-mono text-xs tracking-[0.18em] uppercase">
        {"// "}
        {stat.label}
      </dt>
    </div>
  );
}

/** Eases a number from 0 to `target` once `active` flips true. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion still goes through rAF, but lands on the final value in
    // the first frame instead of animating.
    const effectiveDuration = prefersReducedMotion ? 0 : duration;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = effectiveDuration === 0 ? 1 : Math.min((now - start) / effectiveDuration, 1);
      // easeOutCubic
      setValue(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}
