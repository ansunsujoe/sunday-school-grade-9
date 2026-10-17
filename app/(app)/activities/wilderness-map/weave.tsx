/**
 * The Exodus's woven tent-cloth lattice (the same diamonds as .ex-backdrop in
 * globals.css), laid over the land. Its tiles keep their size on screen as
 * the map zooms.
 */
export function Weave({ id, k = 1 }: { id: string; k?: number }) {
  const s = 44 * k;
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      <g fill="none" stroke="var(--wm-weave)" strokeWidth={k} transform={`scale(${k})`}>
        <path d="M22 0 44 22 22 44 0 22Z" />
        <path d="M22 9 35 22 22 35 9 22Z" />
      </g>
      <g fill="var(--wm-weave)" transform={`scale(${k})`}>
        <circle cx={22} cy={22} r={1.6} />
        <circle cx={0} cy={0} r={1.2} />
        <circle cx={44} cy={0} r={1.2} />
        <circle cx={0} cy={44} r={1.2} />
        <circle cx={44} cy={44} r={1.2} />
      </g>
    </pattern>
  );
}
