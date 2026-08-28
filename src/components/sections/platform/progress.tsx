export /** Two-tone progress rail. */
function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-[3px] w-full rounded-[2px] bg-white/10">
      {/* Scaled rather than sized, so the fill animation runs on the compositor. */}
      <div
        className="led-fill h-full rounded-[2px]"
        style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%`, background: color }}
      />
    </div>
  );
}
