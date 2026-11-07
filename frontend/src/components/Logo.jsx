import { APP_NAME } from "../lib/brand.js";

// A satellite at perigee, the point of its orbit closest to the planet.
export function LogoMark({ size = 26 }) {
  return (
    <svg className="logo__mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g transform="rotate(-35 16 16)">
        <ellipse cx="14.5" cy="16" rx="12" ry="7" stroke="var(--ion)" strokeWidth="1.25" />
        <circle cx="20" cy="16" r="2.8" fill="var(--ink)" />
        <circle cx="26.5" cy="16" r="2.4" fill="var(--plasma)" />
      </g>
    </svg>
  );
}

export default function Logo({ size }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo__word">{APP_NAME}</span>
    </span>
  );
}
