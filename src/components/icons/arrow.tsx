/** Right chevron used by links and buttons. Sized by the caller. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" />
    </svg>
  );
}
