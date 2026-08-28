"use client";

import Image from "next/image";
import { live } from "@/content/live";
import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

/**
 * Phone mockup for the Live section on small screens.
 *
 * The desktop `TerminalFrame` hinges a bare screenshot up out of the page,
 * which reads wrong on artwork that already contains a hand and a device. Here
 * the whole mockup lifts in from below instead — see `.lift-*` in globals.css
 * for the timing; this only decides when the sequence starts.
 */
export function TerminalLift({ className }: { className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>("0px");

  return (
    <div
      ref={ref}
      className={cn("lift-scene relative isolate w-full", inView && "is-in", className)}
    >
      <div className="relative flex justify-center">
        {/* Ambient glow behind the mockup: 675.158x533.29 at 87.71deg, per the
            design inspector. Figma measures rotation anticlockwise, so the CSS
            angle is negated. Its centre sits above the mockup's — in the design
            the ellipse washes the heading too, not just the phone. */}
        <span
          aria-hidden
          className="lift-halo pointer-events-none absolute top-[33%] left-1/2 z-0 h-[533.29px] w-[675.158px] -translate-x-1/2 -translate-y-1/2 -rotate-[87.71deg] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,--alpha(var(--color-accent)/22%)_0%,--alpha(var(--color-accent)/6%)_55%,--alpha(var(--color-accent)/0%)_100%)]"
        />

        {/* Contact shadow under the hand. */}
        <span
          aria-hidden
          className="lift-cast pointer-events-none absolute bottom-[2%] left-1/2 z-0 h-[60px] w-[62%] bg-[radial-gradient(closest-side,--alpha(var(--color-black)/85%),transparent_74%)] blur-[26px]"
        />

        {/* 358px is the full content width at the design's 390px frame, so this
            is simply the gutter width, capped at the artwork's native size. */}
        <div className="lift-mock relative z-[2] w-full max-w-[358px]">
          {/* Screen backlight, sized to the artwork's screen window. */}
          <span
            aria-hidden
            className="lift-glow pointer-events-none absolute z-0 bg-[radial-gradient(closest-side,--alpha(var(--color-accent)/42%),transparent_74%)] blur-[46px]"
            style={{
              left: "var(--lift-screen-x)",
              top: "var(--lift-screen-y)",
              width: "var(--lift-screen-w)",
              height: "var(--lift-screen-h)",
            }}
          />

          <Image
            src={live.screenshotMobile}
            alt="PERPTools trading terminal running on a phone"
            width={358}
            height={515}
            quality={100}
            unoptimized
            sizes="(max-width: 640px) 94vw, 358px"
            className="relative z-[1] h-auto w-full select-none"
          />

          {/* The sheen is clipped to the glass so it crosses the screen rather
              than sliding over the hand holding the phone. */}
          <span
            aria-hidden
            className="lift-glass pointer-events-none absolute z-[3] overflow-hidden rounded-[6.5%/4.6%]"
            style={{
              left: "var(--lift-screen-x)",
              top: "var(--lift-screen-y)",
              width: "var(--lift-screen-w)",
              height: "var(--lift-screen-h)",
            }}
          >
            <span className="lift-sheen absolute top-[-30%] bottom-[-30%] block w-[46%] bg-[linear-gradient(104deg,transparent,--alpha(var(--color-accent-light)/20%),transparent)]" />
          </span>
        </div>

        {/* Bottom fade: the mockup dissolves into the page rather than ending on
            a cut edge. 318px of the 515px artwork, per the design file. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-[318px] bg-[linear-gradient(0deg,var(--color-bg-0)_0%,--alpha(var(--color-bg-0)/0%)_100%)]"
        />
      </div>
    </div>
  );
}
