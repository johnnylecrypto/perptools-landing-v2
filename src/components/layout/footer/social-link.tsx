/** One square social tile in the footer's row. */

export function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-fg-subtle flex h-10 flex-1 items-center justify-center rounded-[9.41px] shadow-[inset_0_0_0_1.18px_--alpha(var(--color-white)/6%)] transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}
