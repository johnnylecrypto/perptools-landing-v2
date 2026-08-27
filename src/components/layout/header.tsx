"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { primaryNav, type NavItem } from "@/content/navigation";
import { site } from "@/lib/site";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-line bg-bg-0/80 border-b backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      {/* 80px tall: 20px vertical padding around a 40px lockup. The page gutter
          (61.5px) plus the header's own 38.5px inset puts the lockup at x=100,
          matching the design file. The inset is dropped below lg, where it would
          eat into the phone gutter instead of adding to it. */}
      <nav aria-label="Main" className="frame [--frame-max:100px] [--frame-width:1240px]">
        <div className="flex h-20 items-center justify-between">
          <Logo onClick={() => setOpen(false)} />

          <ul className="hidden items-center gap-9 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.label}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>

          <LaunchAppButton className="hidden lg:inline-flex" />

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="border-line-strong text-fg flex size-10 items-center justify-center rounded-lg border lg:hidden"
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-200",
                  open && "top-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-200",
                  open && "bottom-1.5 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-line bg-bg-0/95 border-t backdrop-blur-xl lg:hidden"
      >
        <ul className="px-side flex flex-col gap-1 py-6">
          {primaryNav.map((item) => (
            <li key={item.label}>
              <NavLink item={item} className="block py-3" onClick={() => setOpen(false)} />
            </li>
          ))}
        </ul>
        <div className="px-side pb-8">
          <LaunchAppButton className="w-full" onClick={() => setOpen(false)} />
        </div>
      </div>
    </header>
  );
}

/** 147×40 gradient pill from the design file. */
function LaunchAppButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <a
      href={site.links.app}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        "rounded-button inline-flex h-10 min-w-[147px] items-center justify-center px-3",
        "font-dm bg-[image:var(--gradient-accent)] text-[15px] font-semibold text-[#000510]",
        "transition-[background-image,box-shadow,transform] duration-250",
        "ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[image:var(--gradient-accent-hover)]",
        "hover:shadow-[var(--shadow-accent)]",
        className,
      )}
    >
      Launch App
    </a>
  );
}

function NavLink({
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
