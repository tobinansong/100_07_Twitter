import { useState } from "react";
import { initialsOf } from "../lib/format.js";

// Sizes are defined in ui.css. The small satellite circles the avatar on hover.
export default function Avatar({ user, size = "md" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const src = user?.profileImg;
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span className={`avatar avatar--${size}`}>
      <span className="avatar__face">
        {showImage ? (
          <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailedSrc(src)} />
        ) : (
          <span className="avatar__initials" aria-hidden="true">
            {initialsOf(user)}
          </span>
        )}
      </span>
      <span className="avatar__orbit" aria-hidden="true" />
    </span>
  );
}
