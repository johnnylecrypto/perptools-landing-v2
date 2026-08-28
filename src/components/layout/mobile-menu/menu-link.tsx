import Link from "next/link";
import type { NavItem } from "@/content/navigation";

/** A mobile-nav entry; closes the sheet on the way out. */

export function MenuLink({ item, onClose }: { item: NavItem; onClose: () => void }) {
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
