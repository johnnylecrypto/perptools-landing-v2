import { Ellipse } from "@/components/ui/ellipse";
import { HeroGodRaysVideo } from "./hero-god-rays-video";

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

        <picture>
          <source media="(min-width: 640px)" srcSet="/media/bg-removal.webp" />
          <img
            src="/media/bg-removal-mobile.webp"
            alt=""
            width={640}
            height={548}
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            className="absolute top-[75px] left-[-17px] w-[797px] max-w-none opacity-35 select-none sm:top-[76px] sm:left-1/2 sm:w-[917px] sm:-translate-x-1/2 sm:opacity-60"
          />
        </picture>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_38%_at_50%_46%,--alpha(var(--color-bg-0)/82%)_0%,--alpha(var(--color-bg-0)/45%)_55%,transparent_100%)]" />
      </div>

      <div className="absolute inset-0 bg-[url('/media/noise.webp')] bg-size-[128px_128px] bg-repeat opacity-40" />

      {/* Still underlay on mobile while the video mounts; full fallback for reduced motion. */}
      <div className="absolute inset-0 block bg-[url('/media/god-rays-still.webp')] bg-cover bg-top opacity-[0.54] mix-blend-soft-light sm:hidden motion-reduce:sm:block sm:opacity-35 sm:mix-blend-screen" />

      <HeroGodRaysVideo />

      {/* Last in the stack so it feathers noise/video into the page surface. */}
      <div className="absolute inset-x-0 bottom-0 h-[105px] bg-[linear-gradient(0deg,var(--color-bg-0)_0%,--alpha(var(--color-bg-0)/85%)_55%,transparent_100%)]" />
    </div>
  );
}
