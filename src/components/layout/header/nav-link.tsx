import Link from "next/link";
import type { NavItem } from "@/content/navigation";
import { cn } from "@/lib/utils";

/** A primary-nav entry; external items leave the site in a new tab. */

export function NavLink({
  item,
  className,
  onClick,
}: {
  item: NavItem;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "font-dm text-[18px] font-medium leading-[21px] text-white transition-colors hover:text-accent-light",
    className,
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={onClick}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={classes} onClick={onClick}>
      {item.label}
    </Link>
  );
}
