import Image from "next/image";
import { Ellipse } from "@/components/ui/ellipse";

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-black/15" />

      <div className="absolute inset-0 mx-auto w-full max-w-[1440px]">
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
          className="absolute top-[75px] left-[-17px] w-[797px] max-w-none opacity-35 select-none sm:top-[76px] sm:left-1/2 sm:w-[917px] sm:-translate-x-1/2 sm:opacity-60 xl:translate-x-[calc(-50%+17.5px)]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_38%_at_50%_46%,--alpha(var(--color-bg-0)/82%)_0%,--alpha(var(--color-bg-0)/45%)_55%,transparent_100%)]" />
      </div>

      <div className="absolute inset-0 bg-[url('/media/noise.webp')] bg-cover bg-center bg-no-repeat opacity-40" />

      {/* Sources via innerHTML, not children: media extensions inject controls
          into a <video> before React hydrates, and React only skips diffing an
          element's children when they came from dangerouslySetInnerHTML. */}
      <video
        suppressHydrationWarning
        poster="/media/god-rays-still.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 size-full object-cover object-top opacity-[0.54] mix-blend-soft-light motion-reduce:hidden sm:opacity-35 sm:mix-blend-screen"
        dangerouslySetInnerHTML={{
          __html:
            '<source src="/media/god-rays.webm" type="video/webm">' +
            '<source src="/media/god-rays.mp4" type="video/mp4">',
        }}
      />

      <div className="absolute inset-0 hidden bg-[url('/media/god-rays-still.webp')] bg-cover bg-top opacity-[0.54] mix-blend-soft-light motion-reduce:block sm:opacity-35 sm:mix-blend-screen" />

      {/* Last in the stack so it feathers noise/video into the page surface. */}
      <div className="absolute inset-x-0 bottom-0 h-[105px] bg-[linear-gradient(0deg,var(--color-bg-0)_0%,--alpha(var(--color-bg-0)/85%)_55%,transparent_100%)]" />
    </div>
  );
}
