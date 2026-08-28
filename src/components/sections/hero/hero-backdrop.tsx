import Image from "next/image";
import { Ellipse } from "@/components/ui/ellipse";
import { GridLines } from "@/components/ui/grid-lines";

export /**
 * Layer stack, bottom to top:
 * noise → grid → glow blobs → logo art → bottom fade → god-rays video.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/15" />

      {/* One block spanning the full section height, inset by the same gutter
          as the content. The design file stacks two 610.5px blocks instead, but
          they overlap by 31px and leave a doubled-up band across the seam. */}
      {/* The cell is fixed px, so on a 390px phone it reads ~3.4x coarser than
          on a 1440 frame. Mobile divides the cell by 5 (~5.99x6.43) and uses the
          design's 0.35px hairline; desktop keeps the exported 29.95x32.13 grid. */}
      <GridLines
        scale={0.2}
        stroke={0.35}
        idSuffix="-sm"
        className="right-side left-side absolute inset-y-0 opacity-40 mix-blend-overlay sm:hidden"
      />
      <GridLines className="right-side left-side absolute inset-y-0 hidden opacity-40 mix-blend-overlay sm:block" />

      {/* Glow and logo art stay inside the 1440 design frame instead of
          stretching on ultra-wide displays. */}
      {/* Centred with `inset-0 + mx-auto`, never a transform: a transform would
          create a stacking context, and the blended ellipses inside would then
          composite against nothing instead of the noise layer below. */}
      <div className="absolute inset-0 mx-auto w-full max-w-[1440px]">
        {/* The mobile file replaces the single wide glow with two narrow
            columns — a screened teal and a soft-light cyan. */}
        <Ellipse
          color="var(--color-accent-deep)"
          width={212.74}
          height={764.78}
          left={101.38}
          top={-322.79}
          blur={52.07}
          className="sm:hidden"
        />
        <Ellipse
          color="var(--color-accent-soft)"
          width={203.13}
          height={777.48}
          left={249.64}
          top={-132.17}
          blur={52.07}
          blend="soft-light"
          className="sm:hidden"
        />

        <Ellipse
          color="var(--color-accent-deep)"
          width={785.5034}
          height={700.7598}
          left={374.3438}
          top={-295.7617}
          radius={102.3364}
          className="hidden sm:block"
        />

        <Image
          src="/media/bg-removal.webp"
          alt=""
          width={917}
          height={786}
          priority
          sizes="(max-width: 768px) 100vw, 64vw"
          // Mobile design pins the art at 797×684 / x=-48 / y=83 — its centre
          // sits right of the viewport centre, so it is anchored, not centred.
          // From sm it is centred on the frame. The design's x=279 is 17.5px
          // right of centre *in a 1440 frame*; as a fixed left it threw the art
          // off-centre on anything narrower (a 1024 laptop pushed it 156px
          // right), so the nudge is expressed against the centre instead.
          className="absolute top-[83px] left-[-48px] w-[797px] max-w-none translate-x-0 opacity-60 select-none sm:top-[76px] sm:left-1/2 sm:w-[917px] sm:-translate-x-1/2 xl:translate-x-[calc(-50%+17.5px)]"
        />

        {/* Vignette so the headline keeps contrast over the logo art. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_38%_at_50%_46%,--alpha(var(--color-bg-0)/82%)_0%,--alpha(var(--color-bg-0)/45%)_55%,transparent_100%)]" />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[62px] bg-[linear-gradient(0deg,var(--color-bg-1)_0%,--alpha(var(--color-bg-1)/0%)_100%)]" />

      {/* Noise grains everything below it in one pass. The design file has it as
          the container background (bottom of the stack), but there it only
          darkens the already near-black ground — the grain became visible only
          where the blended glows sit, i.e. the right half. */}
      <div className="absolute inset-0 bg-[url('/media/noise.webp')] bg-cover bg-center bg-no-repeat opacity-40" />

      {/* Square 1024 source: object-top keeps the rays anchored at their origin.
          Centred cover would crop 315px off the top on a 1440x810 desktop and
          cut the beams' source away. */}
      <video
        poster="/media/god-rays-still.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 size-full object-cover object-top opacity-[0.54] mix-blend-soft-light motion-reduce:hidden sm:opacity-35 sm:mix-blend-screen"
      >
        <source src="/media/god-rays.webm" type="video/webm" />
        <source src="/media/god-rays.mp4" type="video/mp4" />
      </video>

      {/* Reduced motion gets the same light, held still, instead of nothing. */}
      <div className="absolute inset-0 hidden bg-[url('/media/god-rays-still.webp')] bg-cover bg-top opacity-[0.54] mix-blend-soft-light motion-reduce:block sm:opacity-35 sm:mix-blend-screen" />
    </div>
  );
}
