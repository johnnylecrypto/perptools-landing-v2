import Link from "next/link";
import type { NavItem } from "@/content/navigation";

/** A footer column entry; external items leave the site in a new tab. */

export function FooterLink({ item }: { item: NavItem }) {
  const className =
    "text-[14px] whitespace-nowrap text-white/80 transition-colors hover:text-white";

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}
