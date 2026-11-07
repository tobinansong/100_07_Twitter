import { useEffect, useRef } from "react";
import { seededRandom } from "../lib/seed.js";

const STARS_PER_PIXEL = 1 / 6500;

// Stars are painted once and only repainted on resize, so they cost nothing while scrolling.
function paintStars(canvas) {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;

  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(ratio, ratio);

  const random = seededRandom(7);
  const count = Math.round(width * height * STARS_PER_PIXEL);
  for (let i = 0; i < count; i += 1) {
    const kind = random();
    const x = random() * width;
    const y = random() * height;
    context.globalAlpha = 0.14 + random() * random() * 0.8;
    context.fillStyle = kind > 0.93 ? "#ffd2b8" : "#cfe9f7";
    const size = kind > 0.98 ? 1.7 : kind > 0.8 ? 1.15 : 0.75;
    context.fillRect(x, y, size, size);
  }
}

export default function OrbitField({ variant = "app" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let frame = 0;
    paintStars(canvas);

    // Mobile address bars change the height while scrolling. Ignore that when it shrinks.
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width === lastWidth && height <= lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paintStars(canvas));
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={`orbit-field orbit-field--${variant}`} aria-hidden="true">
      <canvas ref={canvasRef} className="orbit-field__stars" />
      <div className="orbit-field__system">
        <div className="planet">
          <span className="planet__flare" />
        </div>
        <svg className="orbit-field__rings" viewBox="0 0 1600 1600" fill="none">
          <g className="ring ring--a">
            <circle cx="800" cy="800" r="520" />
            <circle className="ring__body" cx="800" cy="280" r="4" />
          </g>
          <g className="ring ring--b">
            <circle cx="800" cy="800" r="640" strokeDasharray="2 12" />
            <circle className="ring__body ring__body--hot" cx="1440" cy="800" r="4.5" />
          </g>
          <g className="ring ring--c">
            <circle cx="800" cy="800" r="780" />
            <circle className="ring__body" cx="800" cy="1580" r="3" />
          </g>
        </svg>
      </div>
    </div>
  );
}
