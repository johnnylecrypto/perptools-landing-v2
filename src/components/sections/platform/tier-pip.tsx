export function TierPip({
  color,
  reached,
  label,
}: {
  color: string;
  reached: boolean;
  label: string;
}) {
  return (
    <svg viewBox="0 0 22 19.32" role="img" aria-label={label} className="h-[13.2px] w-[15px]">
      <polygon
        points="16,1 21,9.66 16,18.32 6,18.32 1,9.66 6,1"
        fill={reached ? color : "none"}
        stroke={color}
        strokeOpacity={reached ? 1 : 0.3}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
