import Image from "next/image";
import { mobileNav } from "@/content/navigation";
import { site } from "@/lib/site";
import { captureLandingEvent } from "@/lib/analytics";
import { DiscordIcon } from "@/components/icons/discord";
import { XIcon } from "@/components/icons/x";
import { ArrowIcon } from "@/components/icons/arrow";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { Ellipse } from "@/components/ui/ellipse";
import { cn } from "@/lib/utils";
import { MenuLink } from "./menu-link";

/** Social rows below the divider, per the mobile design. */
const socialLinks = [
  { label: "twitter", href: site.links.x, Icon: XIcon },
  { label: "discord", href: site.links.discord, Icon: DiscordIcon },
] as const;

/** Black base + hero art from the mobile MENU frame, beneath the frosted sheet. */
function MenuBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 mx-auto w-full max-w-[1440px]">
        <Ellipse
          color="var(--color-accent-deep)"
          width={212.74}
          height={764.78}
          left={101.38}
          top={-322.79}
          blur={52.07}
        />
        <Ellipse
          color="var(--color-accent-soft)"
          width={203.13}
          height={777.48}
          left={249.64}
          top={-132.17}
          blur={52.07}
          blend="soft-light"
        />
        <Image
          src="/media/bg-removal.webp"
          alt=""
          width={797}
          height={684}
          sizes="100vw"
          className="absolute top-[75px] left-[-17px] w-[797px] max-w-none opacity-35 select-none"
        />
      </div>
      <div className="absolute inset-0 bg-[url('/media/noise.webp')] bg-cover bg-center bg-no-repeat opacity-[0.54] mix-blend-soft-light" />
    </div>
  );
}

/**
 * Full-height navigation sheet for phones.
 *
 * Sits under the 64px header bar and runs to the bottom of the viewport: the
 * links sit at the top, the CTA is pinned to the foot. Rendered by `Header`,
 * which owns the open state and the trigger button.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div id="mobile-menu" hidden={!open} className="fixed inset-0 z-40 lg:hidden">
      <MenuBackdrop />

      {/* Frosted sheet: Figma node 5352:1010800 — blur 20px, white/1% → #030405/1% @ 35.755%. */}
      <div
        className={cn(
          "absolute inset-x-0 top-16 bottom-0 flex flex-col justify-between gap-6 p-4",
          "border-b border-white/10 backdrop-blur-[20px]",
          "bg-[linear-gradient(180deg,rgb(255_255_255/0.01)_0%,rgb(3_4_5/0.01)_35.755%)]",
        )}
      >
      <ul className="flex flex-col gap-3 overflow-y-auto">
        {mobileNav.map((item) => (
          <li key={item.label}>
            <MenuLink item={item} onClose={onClose} />
          </li>
        ))}

        <li aria-hidden className="h-px bg-white/15" />

        {socialLinks.map(({ label, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="font-dm flex items-center gap-2.5 rounded p-2 text-base leading-6 font-semibold text-white/60 transition-colors hover:text-white"
            >
              <span className="flex flex-1 items-center gap-1.5">
                <Icon className="size-5 shrink-0" />
                {label}
              </span>
              <ExternalLinkIcon className="size-4 shrink-0" />
            </a>
          </li>
        ))}
      </ul>

      <a
        href={site.links.appPlain}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void captureLandingEvent("landing_top_bar_launch_app");
          onClose();
        }}
        className={cn(
          "rounded-button flex h-13 w-full items-center justify-center gap-[7px] px-12",
          "font-dm text-bg-2 bg-[image:var(--gradient-accent)] text-base leading-6 font-bold",
          "transition-[background-image,box-shadow] duration-250",
          "ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[image:var(--gradient-accent-hover)]",
        )}
      >
        Launch App
        <ArrowIcon className="size-3.5" />
      </a>
      </div>
    </div>
  );
}
