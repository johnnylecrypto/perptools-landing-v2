import { mobileNav } from "@/content/navigation";
import { site } from "@/lib/site";
import { DiscordIcon } from "@/components/icons/discord";
import { XIcon } from "@/components/icons/x";
import { ArrowIcon } from "@/components/icons/arrow";
import { ExternalLinkIcon } from "@/components/icons/external-link";
import { cn } from "@/lib/utils";
import { MenuLink } from "./menu-link";

/** Social rows below the divider, per the mobile design. */
const socialLinks = [
  { label: "twitter", href: site.links.x, Icon: XIcon },
  { label: "discord", href: site.links.discord, Icon: DiscordIcon },
] as const;

/**
 * Full-height navigation sheet for phones.
 *
 * Sits under the 64px header bar and runs to the bottom of the viewport: the
 * links sit at the top, the CTA is pinned to the foot. Rendered by `Header`,
 * which owns the open state and the trigger button.
 */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      id="mobile-menu"
      hidden={!open}
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col justify-between gap-6 p-4 lg:hidden",
        "border-b border-white/10 backdrop-blur-[20px]",
        "bg-[linear-gradient(180deg,--alpha(var(--color-white)/1%)_0%,--alpha(var(--color-bg-0)/1%)_36%)]",
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
        href={site.links.app}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
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
  );
}
