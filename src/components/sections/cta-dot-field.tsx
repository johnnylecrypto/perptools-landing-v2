"use client";

import { useEffect, useRef } from "react";
import { LOGO_DOTS as LOGO } from "@/lib/cta-logo-dots";
import { cn } from "@/lib/utils";

/* ── knobs ───────────────────────────────────────────────────── */
const CORE = { x: 0.503, y: 0.5035 }; /* where the ring sits inside the logo */
const NUDGE = { x: 0, y: 0 }; /* manual offset of the mark, px */

const RK = 0.5; /* dot radius as a share of the lattice pitch */

const SPEED = 0.75;
const SWELL = 0.07; /* slow breathing of the whole field */

const PLACEMENT = {
  mark: {
    /** Logo height, as a share of the mark box. */
    fill: 1,
    alpha: 0.88,
    crest: 0.48,
    waveRatio: 0.21,
    textFade: null as null | [number, number],
    edges: { x0: 26, x1: 26, y0: 20, y1: 20 },
  },
  bleed: {
    fill: 1.55,
    alpha: 0.82,
    crest: 0.45,
    waveRatio: 0.21,
    textFade: [0.34, 0.56] as null | [number, number],
    edges: { x0: 30, x1: 46, y0: 24, y1: 24 },
  },
};

export type DotFieldVariant = keyof typeof PLACEMENT;

const BUCKETS = 6; /* alpha steps — dots are batched into 6 fills per frame */

type Dot = { x: number; y: number; m: number; ph: number; fd: number; rad: number };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export function CtaDotField({
  variant = "mark",
  className,
}: {
  variant?: DotFieldVariant;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const place = PLACEMENT[variant];
    const cvs = canvasRef.current;
    const root = cvs?.parentElement;
    if (!cvs || !root) return;

    const mark = root.querySelector<HTMLElement>("[data-dot-mark]");
    const act = root.querySelector<HTMLElement>("[data-dot-act]");
    const ctx = cvs.getContext("2d");
    if (!act || !ctx) return;
    if (variant === "mark" && !mark) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const channels = (token: string) => {
      const hex = rootStyle.getPropertyValue(token).trim();
      return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    };
    const DOT = channels("--color-dot");
    const DOT_CREST = channels("--color-dot-crest");

    /* base64 → "cell index → brightness 0…15" */
    const bin = atob(LOGO.d);
    const cellAt = (i: number) => {
      const b = bin.charCodeAt(i >> 1);
      return i & 1 ? b & 15 : b >> 4;
    };

    let W = 0;
    let H = 0;
    let dots: Dot[] = [];
    let pool: Float32Array[] = [];
    const counts = new Int32Array(BUCKETS);

    function layoutCenter(el: HTMLElement) {
      let x = el.offsetWidth * 0.5;
      let y = el.offsetHeight * 0.5;
      let n: HTMLElement | null = el;
      while (n && n !== root) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    }

    function build() {
      if (!cvs || !ctx || !act || !root) return;

      if (cvs.offsetParent === null) {
        dots = [];
        return;
      }
      const r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;

      W = r.width;
      H = r.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = W * dpr;
      cvs.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gridH = LOGO.r * LOGO.step;
      const gridW = LOGO.c * LOGO.step;
      const logoH = (variant === "mark" && mark ? mark.offsetHeight : H) * place.fill;
      if (!logoH) return;
      const scale = logoH / gridH;
      const logoW = gridW * scale;

      const step = LOGO.step * scale;

      const bc = layoutCenter(act); /* where the wave starts */
      /* `bleed` puts the logo's ring on the button; `mark` puts it in its box. */
      const mc = variant === "mark" && mark ? layoutCenter(mark) : bc;
      const ox = mc.x + NUDGE.x - logoW * CORE.x;
      const oy = mc.y + NUDGE.y - logoH * CORE.y;

      const wave = logoW * place.waveRatio;

      dots = [];
      for (let row = 0; row < LOGO.r; row += 1) {
        const y = oy + row * step;
        if (y < -step || y > H + step) continue;

        for (let col = 0; col < LOGO.c; col += 1) {
          const q = cellAt(row * LOGO.c + col);
          if (!q) continue;

          const x = ox + col * step;
          if (x < -step || x > W + step) continue;

          let m = (q / 15) * place.alpha;
          /* Keep clear of the copy, then dissolve near the card edges. */
          if (place.textFade) m *= smooth(W * place.textFade[0], W * place.textFade[1], x);
          m *=
            smooth(0, place.edges.x0, x) *
            smooth(0, place.edges.x1, W - x) *
            smooth(0, place.edges.y0, y) *
            smooth(0, place.edges.y1, H - y);
          if (m <= 0.012) continue;

          const rr = Math.hypot(x - bc.x, y - bc.y); /* distance to the button */
          dots.push({
            x,
            y,
            m,
            ph: rr / wave,
            fd: 0.34 + Math.exp(-rr / (H * 2.4)) * 0.66,
            rad: step * RK * (0.45 + m * 0.55),
          });
        }
      }

      pool = Array.from({ length: BUCKETS }, () => new Float32Array(dots.length * 3));
    }

    let raf = 0;
    let t0 = 0;
    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!ctx) return;
      if (!t0) t0 = now;
      const t = (now - t0) / 1000;
      const ph = t * SPEED;

      if (!dots.length) return;

      ctx.clearRect(0, 0, W, H);
      counts.fill(0);

      const swell = 1 - SWELL + SWELL * Math.sin(t * 0.62);
      const kA = 0.74 * swell;
      const kC = place.crest * swell;

      for (const p of dots) {
        const wv = Math.sin(p.ph - ph);
        const crest = wv > 0 ? wv * p.fd : 0;

        let a = p.m * (kA + crest * kC);
        if (a <= 0.012) continue;
        if (a > 1) a = 1;

        const b = (a * BUCKETS) | 0;
        const bi = b < BUCKETS ? b : BUCKETS - 1;
        const arr = pool[bi];
        const n = counts[bi];
        arr[n] = p.x;
        arr[n + 1] = p.y;
        arr[n + 2] = p.rad * (1 + crest * 0.34);
        counts[bi] = n + 3;
      }

      for (let b = 0; b < BUCKETS; b++) {
        const n = counts[b];
        if (!n) continue;
        const arr = pool[b];
        ctx.beginPath();
        for (let i = 0; i < n; i += 3) {
          const x = arr[i];
          const y = arr[i + 1];
          const rad = arr[i + 2];
          ctx.moveTo(x + rad, y);
          ctx.arc(x, y, rad, 0, 6.2832);
        }
        const a = (b + 0.5) / BUCKETS;
        const k = a < 0.45 ? 0 : (a - 0.45) / 0.55; /* brighter step → cooler, whiter dot */
        const mixCh = (i: number) => (DOT[i] + (DOT_CREST[i] - DOT[i]) * k) | 0;
        ctx.fillStyle = `rgba(${mixCh(0)},${mixCh(1)},${mixCh(2)},${(a * 0.86).toFixed(3)})`;
        ctx.fill();
      }
    }

    function still() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (const p of dots) {
        ctx.moveTo(p.x + p.rad, p.y);
        ctx.arc(p.x, p.y, p.rad, 0, 6.2832);
      }
      ctx.fillStyle = `rgba(${DOT[0]},${DOT[1]},${DOT[2]},0.58)`;
      ctx.fill();
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    build();

    let rt: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        build();
        if (reduced) still();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    /* fonts shift the text height and with it the button — rebuild once loaded */
    void document.fonts?.ready.then(() => {
      build();
      if (reduced) still();
    });

    let io: IntersectionObserver | undefined;
    if (reduced) {
      still();
    } else {
      io = new IntersectionObserver(
        (entries, obs) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            obs.unobserve(e.target);
            build();
            raf = requestAnimationFrame(frame);
          }
        },
        { threshold: 0.3 },
      );
      io.observe(root);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 block h-full w-full", className)}
    />
  );
}
