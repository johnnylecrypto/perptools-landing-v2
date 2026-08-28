/** Box-with-arrow mark on links that leave the site. Sized by the caller. */
export function ExternalLinkIcon({ className }: { className?: string }) {
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
