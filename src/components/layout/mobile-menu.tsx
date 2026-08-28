import Link from "next/link";
import { mobileNav, type NavItem } from "@/content/navigation";
import { site } from "@/lib/site";
import { XIcon, DiscordIcon } from "@/components/layout/social-icons";
import { ArrowIcon } from "@/components/ui/arrow-icon";
import { cn } from "@/lib/utils";

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
        "bg-[linear-gradient(180deg,rgb(255_255_255/0.01)_0%,rgb(3_4_5/0.01)_36%)]",
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
          "font-dm bg-[image:var(--gradient-accent)] text-base leading-6 font-bold text-[#080C12]",
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

function MenuLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const classes =
    "font-dm block rounded p-2 text-base font-semibold text-white/60 transition-colors hover:text-white";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={onClose}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={classes} onClick={onClose}>
      {item.label}
    </Link>
  );
}

/** 16px "opens in a new tab" glyph, trailing each social row. */
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.5 2.5H13.5V6.5M13.5 2.5 7.5 8.5" />
      <path d="M12.5 9.8v2.9a1.3 1.3 0 0 1-1.3 1.3H3.8a1.3 1.3 0 0 1-1.3-1.3V5.3A1.3 1.3 0 0 1 3.8 4h2.9" />
    </svg>
  );
}
