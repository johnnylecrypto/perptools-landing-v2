/**
 * Live price marker where the chart meets the NOW line.
 *
 * The 20x16 hexagon from the live board (`NOW_MARKER_SVG` in TradeCanvas),
 * kept verbatim so the demo's playhead reads as the same object.
 */
export function PointMarker({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      className={className}
      style={{ filter: "drop-shadow(0 0 5px #2BB9F3CC)" }}
    >
      <path
        d="M5.60254 0.5H14.3975C14.6723 0.500131 14.9039 0.63282 15.0195 0.814453L19.416 7.72168C19.5274 7.89644 19.5274 8.10356 19.416 8.27832L15.0195 15.1846C14.9035 15.3663 14.6717 15.4999 14.3975 15.5H5.60254C5.32777 15.4999 5.09636 15.3673 4.98047 15.1855L0.583984 8.27832C0.47263 8.10351 0.47263 7.89649 0.583984 7.72168L4.97949 0.814453L4.98047 0.81543C5.09669 0.633539 5.32836 0.500123 5.60254 0.5ZM10.001 2.72559C6.86462 2.72562 4.2373 5.04235 4.2373 8C4.23757 10.9574 6.86478 13.2734 10.001 13.2734C13.137 13.2734 15.7644 10.9574 15.7646 8C15.7646 5.04233 13.1372 2.72559 10.001 2.72559Z"
        fill="#2BB9F3"
        stroke="#2BB9F3"
      />
      <path
        d="M10 3.38086C12.7809 3.38086 15 5.54025 15 8.16113C14.9998 10.7819 12.7808 12.9404 10 12.9404C7.21924 12.9404 5.00015 10.7819 5 8.16113C5 5.54025 7.21914 3.38086 10 3.38086Z"
        fill="#0A1018"
        stroke="#2BB9F3"
      />
    </svg>
  );
}
