"use client";

import { useEffect, useRef } from "react";
import { LOGO_DOTS as LOGO } from "@/lib/cta-logo-dots";
import { cn } from "@/lib/utils";

/* ── knobs ───────────────────────────────────────────────────── */
const FILL = 1.0; /* mark height taken up by the logo */
const CORE = { x: 0.503, y: 0.5035 }; /* where the ring sits inside the logo */
const NUDGE = { x: 0, y: 0 }; /* manual offset of the mark, px */

const DOT_GAP = 2.3; /* on-screen dot pitch, px — the grid thins itself to match */
const RK = 0.5; /* dot radius as a share of the pitch */
const ALPHA = 0.88; /* overall field brightness */

const WAVE_R = 0.4; /* wavelength as a share of the logo width */
const SPEED = 0.75;
const CREST = 0.48; /* extra brightness on the crest */
const SWELL = 0.07; /* slow breathing of the whole field */
const REACHR = 1.15; /* how far the wave carries from button to mark */

const BUCKETS = 6; /* alpha steps — dots are batched into 6 fills per frame */

type Dot = { x: number; y: number; m: number; ph: number; fd: number; rad: number };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Canvas dot field built from the PERPTools mark: the logo is drawn in the
 * `[data-dot-mark]` box and a wave ripples out of the `[data-dot-act]` button
 * up through it. Both anchors are measured from layout, so text length and
 * card height can change freely.
 */
export function CtaDotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    const root = cvs?.parentElement;
    if (!cvs || !root) return;

    const mark = root.querySelector<HTMLElement>("[data-dot-mark]");
    const act = root.querySelector<HTMLElement>("[data-dot-act]");
    const ctx = cvs.getContext("2d");
    if (!mark || !act || !ctx) return;

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

    /* centre of an element in card coordinates, ignoring transforms —
       entrance animations shift elements, so getBoundingClientRect would lie */
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
      if (!cvs || !ctx || !mark || !act || !root) return;
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
      const logoH = mark.offsetHeight * FILL;
      if (!logoH) return;
      const scale = logoH / gridH;
      const logoW = gridW * scale;

      /* thin the grid so the on-screen grain stays constant */
      const step = LOGO.step * scale;
      const density = Math.max(1, Math.round(DOT_GAP / step));
      const gap = step * density;

      const mc = layoutCenter(mark); /* where the mark sits */
      const bc = layoutCenter(act); /* where the wave starts */
      const ox = mc.x + NUDGE.x - logoW * CORE.x;
      const oy = mc.y + NUDGE.y - logoH * CORE.y;

      const wave = logoW * WAVE_R;
      const span = Math.hypot(mc.x - bc.x, mc.y - bc.y);
      const soft = Math.max(logoW * 0.9, span * REACHR);

      dots = [];
      for (let row = 0; row < LOGO.r; row += density) {
        const y = oy + row * step;
        if (y < -gap || y > H + gap) continue;

        for (let col = 0; col < LOGO.c; col += density) {
          const q = cellAt(row * LOGO.c + col);
          if (!q) continue;

          const x = ox + col * step;
          if (x < -gap || x > W + gap) continue;

          let m = (q / 15) * ALPHA;
          m *=
            smooth(0, 26, x) *
            smooth(0, 26, W - x) /* dissolve near the card edges */ *
            smooth(0, 20, y) *
            smooth(0, 20, H - y);
          if (m <= 0.012) continue;

          const rr = Math.hypot(x - bc.x, y - bc.y); /* distance to the button */
          dots.push({
            x,
            y,
            m,
            ph: rr / wave,
            fd: 0.34 + Math.exp(-rr / soft) * 0.66,
            rad: gap * RK * (0.45 + m * 0.55),
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

      ctx.clearRect(0, 0, W, H);
      counts.fill(0);

      const swell = 1 - SWELL + SWELL * Math.sin(t * 0.62);
      const kA = 0.74 * swell;
      const kC = CREST * swell;

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
        ctx.fillStyle = `rgba(${(150 + k * 46) | 0},${(205 + k * 33) | 0},${(238 + k * 17) | 0},${(a * 0.86).toFixed(3)})`;
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
      ctx.fillStyle = "rgba(150,205,238,.58)";
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 block h-full w-full", className)}
    />
  );
}
