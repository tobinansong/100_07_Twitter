import { useId, useMemo } from "react";
import { hashString, seededRandom } from "../lib/seed.js";

function buildScene(seed) {
  const random = seededRandom(hashString(seed));
  const px = 180 + random() * 840;
  const py = 300 + random() * 240;
  const pr = 170 + random() * 90;

  const stars = Array.from({ length: 70 }, () => ({
    x: random() * 1200,
    y: random() * 400,
    r: 0.4 + random() * 0.9,
    o: 0.2 + random() * 0.65,
  }));

  const orbits = Array.from({ length: 4 }, (_, index) => {
    const rx = pr + 90 + index * (70 + random() * 60);
    const ry = rx * (0.28 + random() * 0.2);
    const tilt = -24 + random() * 48;
    const angle = random() * Math.PI * 2;
    // The body's position on the ellipse, before the ellipse is tilted.
    return { rx, ry, tilt, bx: px + Math.cos(angle) * rx, by: py + Math.sin(angle) * ry, dashed: index % 2 === 1 };
  });

  return { px, py, pr, stars, orbits };
}

// A signature orbit map generated from the user id, shown until they set a cover image.
export default function OrbitCover({ seed }) {
  const scene = useMemo(() => buildScene(seed), [seed]);
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg className="orbit-cover" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a1019" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <radialGradient id={`${id}limb`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.86" stopColor="#05070c" />
          <stop offset="0.985" stopColor="#123244" />
          <stop offset="1" stopColor="#8fe4ff" />
        </radialGradient>
      </defs>
      <rect width="1200" height="400" fill={`url(#${id}sky)`} />
      {scene.stars.map((star, index) => (
        <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="#cfe9f7" opacity={star.o} />
      ))}
      <circle cx={scene.px} cy={scene.py} r={scene.pr} fill={`url(#${id}limb)`} />
      {scene.orbits.map((orbit, index) => (
        <g key={index} transform={`rotate(${orbit.tilt} ${scene.px} ${scene.py})`}>
          <ellipse
            cx={scene.px}
            cy={scene.py}
            rx={orbit.rx}
            ry={orbit.ry}
            fill="none"
            stroke="#8fe4ff"
            strokeOpacity={0.34 - index * 0.05}
            strokeDasharray={orbit.dashed ? "2 8" : undefined}
          />
          <circle cx={orbit.bx} cy={orbit.by} r={index === 0 ? 4 : 2.5} fill={index === 0 ? "#ff6a2b" : "#e9eff5"} />
        </g>
      ))}
    </svg>
  );
}
