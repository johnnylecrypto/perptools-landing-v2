/** One square social tile in the footer's row. */

export /** 40px tall pill with a 1.18px hairline, per the design file. */
function SocialLink({
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
      className="flex h-10 flex-1 items-center justify-center rounded-[9.41px] text-[#757A7D] shadow-[inset_0_0_0_1.18px_rgb(255_255_255/0.06)] transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}
