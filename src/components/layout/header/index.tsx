"use client";

import { useEffect, useState } from "react";
import { primaryNav } from "@/content/navigation";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { cn } from "@/lib/utils";
import { LaunchAppButton } from "./launch-app-button";
import { CloseIcon } from "@/components/icons/close";
import { NavLink } from "./nav-link";

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
    <>
      <header
        className={cn(
          // Below lg the bar always carries its own chrome (the mobile design has
          // the hairline + blur at rest); on desktop it only appears once scrolled.
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          "border-white/10 bg-white/[0.01] backdrop-blur-[20px]",
          scrolled || open
            ? "lg:border-line lg:bg-bg-0/80 lg:backdrop-blur-xl"
            : "lg:border-transparent lg:bg-transparent lg:backdrop-blur-none",
        )}
      >
        {/* 80px tall: 20px vertical padding around a 40px lockup. Below lg the
          bar uses the page gutter so the mark lines up with the hero copy
          (the frame's 6% floor sat ~7px further in on a 390px phone). From lg,
          the gutter (61.5px) plus the frame's 38.5px inset puts the lockup at
          x=100, matching the design file. */}
        <nav
          aria-label="Main"
          className="frame [--frame-max:100px] [--frame-width:1240px] max-lg:[padding-inline:var(--spacing-side)]"
        >
          {/* 64px on phones (16px padding around a 32px lockup), 80px from lg. */}
          <div className="flex h-16 items-center justify-between lg:h-20">
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
              className={cn(
                "-mr-1 flex size-8 items-center justify-center transition-colors lg:hidden",
                open ? "text-white/60" : "text-fg",
              )}
            >
              {/* Three 24×3 bars closed; a 20×20 cross once the sheet is open. */}
              {open ? (
                <CloseIcon />
              ) : (
                <span aria-hidden className="relative block h-[19px] w-6">
                  <span className="absolute inset-x-0 top-0 h-[3px] rounded-full bg-current" />
                  <span className="absolute inset-x-0 top-2 h-[3px] rounded-full bg-current" />
                  <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-current" />
                </span>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Sibling of <header>, not a child: the bar's `backdrop-filter` makes it
          a containing block, which would resolve the sheet's `top-16 bottom-0`
          against the 64px bar instead of the viewport. */}
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
