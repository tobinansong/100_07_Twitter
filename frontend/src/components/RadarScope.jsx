// The radar's rings and sweep. The contacts panel adds blips as children.
export default function RadarScope({ children, still = false, fast = false, className = "" }) {
  const classes = ["radar", fast && "radar--fast", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <svg className="radar__grid" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="99" />
        <circle cx="100" cy="100" r="66" />
        <circle cx="100" cy="100" r="33" />
        <path d="M100 1v198M1 100h198" />
        <circle className="radar__ticks" cx="100" cy="100" r="94" pathLength="360" strokeDasharray="1 14" />
      </svg>
      {!still && <div className="radar__sweep" aria-hidden="true" />}
      <span className="radar__you" aria-hidden="true" />
      {children}
    </div>
  );
}
