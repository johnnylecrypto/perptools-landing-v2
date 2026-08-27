import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-button font-semibold " +
  "tracking-[-0.01em] transition-[transform,box-shadow,background-color,border-color] duration-250 " +
  "ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[image:var(--gradient-accent)] text-[#000510] shadow-[var(--shadow-accent)] " +
    "hover:bg-[image:var(--gradient-accent-hover)] hover:-translate-y-px " +
    "hover:shadow-[var(--shadow-accent-hover)]",
  ghost:
    "border border-line-strong bg-white/2 text-fg hover:border-line-accent hover:bg-accent-light/6",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ComponentProps<"button">, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<React.ComponentProps<"a">, keyof CommonProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Renders a `<button>`, a `next/link` for internal hrefs, or a plain `<a>` for
 * external ones (with the matching rel hardening).
 */
export function Button({ variant = "primary", size = "lg", className, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (typeof props.href === "string") {
    const { href, ...rest } = props as ButtonAsLink;
    const isExternal = /^https?:\/\//.test(href);

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
          {...(rest as React.ComponentProps<"a">)}
        />
      );
    }

    return <Link href={href} className={classes} {...(rest as React.ComponentProps<"a">)} />;
  }

  const { type = "button", ...rest } = props as ButtonAsButton;
  return <button type={type} className={classes} {...rest} />;
}
