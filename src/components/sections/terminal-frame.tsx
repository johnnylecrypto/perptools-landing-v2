"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { live } from "@/content/live";
import { cn } from "@/lib/utils";

/** Milliseconds the tilt takes; must match `--rise` in globals.css. */
const RISE_MS = 2200;
const RISE_MS_PHONE = 1900;

/** How far the parallax leans, in degrees. */
const TILT_X = 3.4;
const TILT_Y = 2.6;
/** Lerp factor per frame — low enough that the card trails the cursor. */
const EASING = 0.07;

/**
 * The Live section's terminal, which stands up out of the page as it scrolls
 * into view and then leans very slightly toward the cursor.
 *
 * The tilt itself is CSS (see `.rise-*` in globals.css); this only decides
 * *when* it starts and adds the pointer parallax once the screen has settled.
 */
export function TerminalFrame({ className }: { className?: string }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const card = cardRef.current;
    if (!scene || !card) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      scene.classList.add("is-in");
      return;
    }

    const cleanups: (() => void)[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        scene.classList.add("is-in");
        // It plays once. Re-running it on every pass would turn a moment of
        // punctuation into a tic.
        observer.disconnect();

        const rise = window.matchMedia("(width < 640px)").matches ? RISE_MS_PHONE : RISE_MS;
        // Parallax only after the screen is standing — leaning a panel that is
        // still mid-tilt fights the transition it is in the middle of.
        const armed = window.setTimeout(() => {
          if (window.matchMedia("(pointer: fine)").matches) {
            cleanups.push(armParallax(scene, card));
          }
        }, rise + 300);
        cleanups.push(() => window.clearTimeout(armed));
      },
      { threshold: 0.28 },
    );

    observer.observe(scene);
    return () => {
      observer.disconnect();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={sceneRef} className={cn("rise-scene relative isolate w-full", className)}>
      {/* Backlight behind the panel, and a slow breath once it is lit. */}
      <span
        aria-hidden
        className="rise-glow pointer-events-none absolute top-[56%] left-1/2 z-0 h-[72%] w-[82%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,--alpha(var(--color-accent)/30%),transparent_74%)] blur-[64px]"
      />
      <span
        aria-hidden
        className="rise-breathe pointer-events-none absolute top-[60%] left-1/2 z-0 h-[56%] w-[64%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,--alpha(var(--color-accent-light)/16%),transparent_70%)] opacity-0 blur-[72px]"
      />
      {/* Contact shadow under the bottom edge. */}
      <span
        aria-hidden
        className="rise-floor pointer-events-none absolute bottom-[14px] left-1/2 z-0 h-[26px] w-[70%] bg-[radial-gradient(closest-side,--alpha(var(--color-black)/85%),transparent_76%)] blur-[20px]"
      />

      {/* The design's 1.8px inset outline: Chrome rounds `outline-width` to whole
          pixels, so an inset box-shadow is what actually renders 1.8px. */}
      <div
        ref={cardRef}
        className="rise-card relative z-[2] flex flex-col rounded-[18px] bg-white/10 p-[9px] shadow-[inset_0_0_0_1.8px_var(--color-white)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-[9.26px] left-[5.6%] h-[319px] w-[85%] bg-[image:var(--gradient-terminal-beam)] blur-[112.49px]"
        />

        {/* One pass of glass across the panel as it lands.
            The clip is what makes it a *pass*: the sweep ends past the right
            edge and holds there, so without something to cut it off the bar
            just parks on screen. Clipping here rather than on the card keeps
            the cyan bloom above, which is meant to bleed out, unclipped. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6] overflow-hidden rounded-[18px]"
        >
          <span className="rise-sheen absolute top-[-40%] bottom-[-40%] block w-[30%] bg-[linear-gradient(104deg,transparent,--alpha(var(--color-accent-light)/10%),transparent)]" />
        </span>
        {/* Top bezel highlight, on once the panel reaches vertical. */}
        <span
          aria-hidden
          className="rise-edge pointer-events-none absolute inset-0 z-[7] rounded-[18px] shadow-[inset_0_1px_0_--alpha(var(--color-accent-light)/22%)]"
        />

        <div className="rise-screen relative w-full overflow-hidden rounded-[10.12px]">
          <Image
            src={live.screenshot}
            alt="PERPTools trading terminal showing routed perpetual positions against a single margin balance"
            width={1062}
            height={545}
            sizes="(max-width: 1080px) 100vw, 1062px"
            className="h-auto w-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[8] h-[79px] rounded-b-[18px] bg-[linear-gradient(359deg,var(--color-bg-1)_0%,--alpha(var(--color-bg-1)/0%)_100%)]"
        />
      </div>
    </div>
  );
}

/**
 * Cursor lean with inertia.
 *
 * Writes `transform` straight to the node and drops the CSS transition first:
 * the rise transition is on the same property, and leaving it in place would
 * make every pointer move ease over two seconds.
 */
function armParallax(scene: HTMLElement, card: HTMLElement) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame: number | null = null;

  card.style.transition = "none";

  const loop = () => {
    currentX += (targetX - currentX) * EASING;
    currentY += (targetY - currentY) * EASING;
    card.style.transform = `rotateY(${currentX.toFixed(3)}deg) rotateX(${currentY.toFixed(3)}deg) translateZ(6px)`;

    if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
      frame = requestAnimationFrame(loop);
    } else {
      frame = null;
    }
  };

  const kick = () => {
    if (frame === null) frame = requestAnimationFrame(loop);
  };

  const onMove = (event: PointerEvent) => {
    const box = scene.getBoundingClientRect();
    targetX = ((event.clientX - box.left) / box.width - 0.5) * TILT_X;
    targetY = ((event.clientY - box.top) / box.height - 0.5) * -TILT_Y;
    kick();
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    kick();
  };

  scene.addEventListener("pointermove", onMove);
  scene.addEventListener("pointerleave", onLeave);

  return () => {
    scene.removeEventListener("pointermove", onMove);
    scene.removeEventListener("pointerleave", onLeave);
    if (frame !== null) cancelAnimationFrame(frame);
  };
}
