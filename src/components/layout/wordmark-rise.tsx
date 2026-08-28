"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { sheenGradient } from "@/components/layout/wordmark-sheen";

/* ── knobs ───────────────────────────────────────────────────── */
const STEP = 62; /* rise: delay between letters, ms — larger reads slower */
const FROM: "left" | "right" | "centre" = "left"; /* where the wave starts */
const HOLD = 1150; /* rise: one letter's travel, ms — must match the CSS */

const CYCLE = 8000; /* sheen: full cycle, ms */
const SWEEP = 0.62; /* share of the cycle the pass takes; the rest is a rest */
const BAND = 0.6; /* width of the lit band, as a share of the word */
const IMGK = 3.6; /* how much wider the gradient image is than the word */
const GAP = 350; /* beat between the letters landing and the first pass, ms */

/** Word width as a share of its container. The design runs it edge to edge. */
const FIT = 1;

const GRADIENT = sheenGradient(BAND, IMGK);

const LETTERS = [...site.name];
const RISE_TOTAL = (LETTERS.length - 1) * STEP + HOLD;

/** Place in the cascade, so the wave can start from either end or the middle. */
function orderOf(index: number) {
  if (FROM === "right") return LETTERS.length - 1 - index;
  if (FROM === "centre") return Math.abs(index - (LETTERS.length - 1) / 2);
  return index;
}

/**
 * The footer wordmark on wide screens: the letters rise into place, then a
 * light runs across them on a loop.
 *
 * Two effects on one set of letters, and they pull in opposite directions. The
 * rise needs each letter to be its own element behind its own mask; the sheen
 * needs one unbroken band of light crossing the whole word. So there is no
 * single background-clip over the word — every letter carries the same gradient
 * image, and the frame offsets each one by its own position, which is what
 * makes the band continuous with no seam at the letter boundaries.
 *
 * The letters are server-rendered and legible without JavaScript: the effect
 * only arms the entrance and takes over the fill once it can paint it.
 */
export function WordmarkRise({ className }: { className?: string }) {
  const wordRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  /* Arm before paint, so the letters are never seen in their resting state on
     a screen where the entrance is still to come. */
  useLayoutEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    word.dataset.armed = "";
  }, []);

  useEffect(() => {
    const word = wordRef.current;
    const text = textRef.current;
    if (!word || !text) return;

    const letters = Array.from(text.querySelectorAll<HTMLElement>("[data-letter]"));
    let wordWidth = 1;
    let imageWidth = 1;
    const offsets: number[] = [];

    /**
     * Size the word to its container.
     *
     * The design runs the lettering the full width of the footer frame, which a
     * `vw` size cannot reproduce: the frame has its own max-width and its own
     * gutters, and `vw` knows about neither. So measure at a known size and
     * scale from what we get.
     */
    function fit() {
      if (!word || !text) return;
      const available = word.clientWidth;
      if (!available) return;
      text.style.fontSize = "100px";
      const natural = text.getBoundingClientRect().width;
      if (natural) text.style.fontSize = `${((100 * available * FIT) / natural).toFixed(2)}px`;
    }

    function measure() {
      if (!text) return;
      fit();
      wordWidth = text.getBoundingClientRect().width || 1;
      imageWidth = wordWidth * IMGK;
      letters.forEach((letter, i) => {
        /* `offsetLeft`, not a client rect: the letters are mid-transform during
           the entrance, and a rect would report where one currently sits rather
           than where it belongs. */
        offsets[i] = letter.offsetLeft - text.offsetLeft;
        letter.style.backgroundSize = `${imageWidth.toFixed(1)}px 100%`;
      });
    }

    /** `x` is where the band's centre sits, in the word's own coordinates. */
    function put(x: number) {
      /* Background-position counts from the image's left edge while the band
         sits at its middle, hence the half-width; subtracting the letter's own
         offset is what carries one unbroken band across all of them. */
      const p = x - imageWidth * 0.5;
      letters.forEach((letter, i) => {
        letter.style.backgroundPositionX = `${(p - offsets[i]).toFixed(1)}px`;
      });
    }

    function park() {
      put(-wordWidth * 0.5); /* left of the word: base colour only */
    }

    function paint() {
      for (const letter of letters) letter.style.backgroundImage = GRADIENT;
      word?.setAttribute("data-lit", "");
      park();
    }

    let raf = 0;
    let start = 0;
    let live = false;
    let landed = false;

    function frame(now: number) {
      if (!live || !word) return;
      raf = requestAnimationFrame(frame);
      if (!start) start = now;

      /* The band crosses from before the word to past it in `SWEEP` of the
         cycle; the remainder parks it off the right edge, which is the rest. */
      const u = ((now - start) % CYCLE) / CYCLE;
      const from = -wordWidth * 0.5;
      const to = wordWidth * 1.5;
      const x = u < SWEEP ? from + (to - from) * (u / SWEEP) : to;
      put(x);

      /* The glow behind the word swells as the band crosses its middle. */
      const g = Math.exp(-(((x / wordWidth - 0.5) / 0.42) ** 2));
      word.style.setProperty("--g", (0.1 + g * 0.78).toFixed(3));
    }

    measure();
    paint();

    let rt: ReturnType<typeof setTimeout> | undefined;
    const remeasure = () => {
      measure();
      if (!live) park();
    };
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(remeasure, 140);
    };
    window.addEventListener("resize", onResize);
    /* Web fonts change the metrics — remeasure once they land. */
    void document.fonts?.ready.then(remeasure);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      word.style.setProperty("--g", "0.28");
      return () => {
        clearTimeout(rt);
        window.removeEventListener("resize", onResize);
      };
    }

    let entrance: ReturnType<typeof setTimeout> | undefined;

    /* The entrance plays once, on the way in. */
    const enter = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          measure();
          word.classList.add("is-in");
          entrance = setTimeout(() => {
            /* Masks can open up now: nothing is travelling through them, and a
               word with a descender would otherwise stay clipped. */
            word.classList.add("is-landed");
            landed = true;
            live = true;
            raf = requestAnimationFrame(frame);
          }, RISE_TOTAL + GAP);
        }
      },
      { threshold: 0.25 },
    );
    enter.observe(word);

    /* The loop runs only while the footer is on screen. `landed` gates it, or
       this observer would start the band before the letters had arrived. */
    const sustain = new IntersectionObserver(
      (entries) => {
        if (!landed) return;
        for (const entry of entries) {
          if (entry.isIntersecting && !live) {
            live = true;
            raf = requestAnimationFrame(frame);
          } else if (!entry.isIntersecting) {
            live = false;
          }
        }
      },
      { threshold: 0.06 },
    );
    sustain.observe(word);

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      clearTimeout(entrance);
      window.removeEventListener("resize", onResize);
      enter.disconnect();
      sustain.disconnect();
    };
  }, []);

  return (
    /* Decorative: the brand name is already a link at the top of the footer,
       and split into letters this would otherwise be spelled out one character
       at a time by a screen reader. */
    <div ref={wordRef} aria-hidden className={cn("footer-rise", className)}>
      <span ref={textRef} className="footer-rise-text">
        {LETTERS.map((character, index) => (
          <span key={index} className="footer-rise-mask">
            <i
              data-letter
              className="footer-rise-letter"
              style={{ transitionDelay: `${orderOf(index) * STEP}ms` }}
            >
              {character}
            </i>
          </span>
        ))}
      </span>
    </div>
  );
}
