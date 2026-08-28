"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { sheenGradient } from "@/components/layout/wordmark-sheen";

/* ── knobs ───────────────────────────────────────────────────── */
const DIR = 1; /* 1 runs the band to the right, -1 to the left */
const PXSEC = 26; /* belt speed, px per second */

const CYCLE = 7000; /* sheen: full cycle, ms */
const SWEEP = 0.58; /* share of the cycle the pass takes; the rest is a rest */
const BAND = 0.55; /* width of the lit band, as a share of the viewport */
/**
 * How much wider the gradient image is than the view. The image is tiled, so
 * the letters always carry the base colour and the neighbouring copies of the
 * band sit too far out to enter the frame. Below ~2.5 a second band creeps in.
 */
const IMGK = 3.6;

const GRADIENT = sheenGradient(BAND, IMGK);

/**
 * The footer wordmark as a running belt with a light passing over it.
 *
 * One animation frame drives both, and not to save a loop: the belt moves while
 * the light has to stay put, like a lamp hung over a conveyor. Holding the
 * light still means repositioning the gradient against a copy that is sliding,
 * every frame — which needs that copy's offset, so the same code has to run the
 * belt.
 *
 * The server renders one copy, so the wordmark reads without JavaScript; the
 * effect measures it and clones as many as the width needs.
 */
export function WordmarkMarquee({ className }: { className?: string }) {
  const wordRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const word = wordRef.current;
    const track = trackRef.current;
    const probe = track?.firstElementChild as HTMLElement | null;
    if (!word || !track || !probe) return;

    let copies: HTMLElement[] = [probe];
    let copyWidth = 1;
    let viewWidth = 1;
    let imageWidth = 1;

    function build() {
      if (!word || !track || !probe) return;
      viewWidth = word.clientWidth || 1;
      imageWidth = viewWidth * IMGK;

      /* Back to one copy before measuring, so a rebuild does not compound. */
      while (track.children.length > 1) track.lastElementChild?.remove();
      copyWidth = probe.getBoundingClientRect().width || 1;

      /* Enough copies that the belt always covers the view, with slack. */
      const need = Math.ceil(viewWidth / copyWidth) + 2;
      for (let i = 1; i < need; i += 1) {
        const clone = probe.cloneNode(true) as HTMLElement;
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }

      copies = Array.from(track.children) as HTMLElement[];
      for (const copy of copies) {
        copy.style.backgroundImage = GRADIENT;
        copy.style.backgroundSize = `${imageWidth.toFixed(1)}px 100%`;
      }
      place(0, -viewWidth);
    }

    /** `offset` slides the belt; `lightX` is where the band sits on screen. */
    function place(offset: number, lightX: number) {
      if (!track) return;
      const shift = DIR > 0 ? offset - copyWidth : -offset;
      track.style.transform = `translateX(${shift.toFixed(2)}px)`;

      /* Background-position counts from the image's left edge and the band sits
         at its middle, hence the half-width; subtracting the copy's on-screen
         position is what leaves the light standing still. */
      const p = lightX - imageWidth * 0.5;
      copies.forEach((copy, i) => {
        copy.style.backgroundPositionX = `${(p - (shift + i * copyWidth)).toFixed(1)}px`;
      });
    }

    let raf = 0;
    let start = 0;
    let live = false;

    function frame(now: number) {
      if (!live || !word) return;
      raf = requestAnimationFrame(frame);
      if (!start) start = now;
      const t = (now - start) / 1000;

      /* Endless slide modulo one copy: the seam is never seen, because the next
         copy is standing exactly where it would show. */
      const offset = (t * PXSEC) % copyWidth;

      /* The pass, then a rest with the band parked off the right edge. */
      const u = ((now - start) % CYCLE) / CYCLE;
      const from = -viewWidth * 0.55;
      const to = viewWidth * 1.55;
      const lightX = u < SWEEP ? from + (to - from) * (u / SWEEP) : to;

      place(offset, lightX);

      const g = Math.exp(-(((lightX / viewWidth - 0.5) / 0.42) ** 2));
      word.style.setProperty("--g", (0.1 + g * 0.8).toFixed(3));
    }

    build();

    let rt: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(build, 140);
    };
    window.addEventListener("resize", onResize);
    /* Web fonts change the copy width — remeasure once they land. */
    void document.fonts?.ready.then(build);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io: IntersectionObserver | undefined;
    if (reduced) {
      word.style.setProperty("--g", "0.28");
    } else {
      /* Runs only while the footer is on screen. */
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !live) {
              live = true;
              raf = requestAnimationFrame(frame);
            } else if (!entry.isIntersecting) {
              live = false;
            }
          }
        },
        { threshold: 0.05 },
      );
      io.observe(word);
    }

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, []);

  return (
    <div ref={wordRef} aria-label={site.name} className={cn("footer-belt", className)}>
      <div ref={trackRef} className="footer-belt-track">
        <span className="footer-belt-copy">{site.name}</span>
      </div>
    </div>
  );
}
