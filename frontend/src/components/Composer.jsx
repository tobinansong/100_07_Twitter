import { useRef, useState } from "react";
import { useAuthUser } from "../hooks/useAuth.js";
import { useCreatePost } from "../hooks/usePosts.js";
import { compressImage, IMAGE_PRESETS } from "../lib/image.js";
import { pushToast } from "../lib/toast.js";
import Avatar from "./Avatar.jsx";
import Icon from "./Icon.jsx";

const MAX_CHARS = 280;
const WARN_AT = 20;
const GAUGE_RADIUS = 9;
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS;

function CharGauge({ used }) {
  const remaining = MAX_CHARS - used;
  const fill = Math.min(used / MAX_CHARS, 1);
  const state = remaining < 0 ? "over" : remaining <= WARN_AT ? "warn" : "ok";

  return (
    <span
      className={`gauge gauge--${state}`}
      role="img"
      aria-label={remaining < 0 ? `${-remaining} characters over the limit` : `${remaining} characters left`}
    >
      {remaining <= WARN_AT && <span className="gauge__value">{remaining}</span>}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="gauge__track" cx="12" cy="12" r={GAUGE_RADIUS} />
        <circle
          className="gauge__fill"
          cx="12"
          cy="12"
          r={GAUGE_RADIUS}
          strokeDasharray={GAUGE_LENGTH}
          strokeDashoffset={GAUGE_LENGTH * (1 - fill)}
        />
      </svg>
    </span>
  );
}

export default function Composer() {
  const { data: me } = useAuthUser();
  const createPost = useCreatePost();
  const fileInput = useRef(null);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [compressing, setCompressing] = useState(false);

  const trimmed = text.trim();
  const canSend =
    (trimmed || image) && text.length <= MAX_CHARS && !createPost.isPending && !compressing;

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCompressing(true);
    try {
      setImage(await compressImage(file, IMAGE_PRESETS.post));
    } catch (error) {
      pushToast(error.message, "error");
    } finally {
      setCompressing(false);
    }
  }

  function send(event) {
    event.preventDefault();
    if (!canSend) return;
    createPost.mutate(
      { text: trimmed || undefined, img: image || undefined },
      {
        onSuccess: () => {
          setText("");
          setImage(null);
          pushToast("Transmission sent.");
        },
      }
    );
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) send(event);
  }

  return (
    <form className="composer" onSubmit={send}>
      <Avatar user={me} size="md" />
      <div className="composer__body">
        <label className="sr-only" htmlFor="composer-text">
          Write a post
        </label>
        <textarea
          id="composer-text"
          className="composer__input"
          placeholder="Send something to the network"
          rows={2}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        {compressing && (
          <p className="eyebrow composer__note" role="status">
            Compressing image
          </p>
        )}

        {image && (
          <div className="composer__preview">
            <img src={image} alt="Selected attachment preview" />
            <button
              type="button"
              className="icon-btn composer__remove"
              aria-label="Remove image"
              onClick={() => setImage(null)}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        <div className="composer__bar">
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFile}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label="Attach an image"
            title="Attach an image"
            disabled={compressing}
            onClick={() => fileInput.current?.click()}
          >
            <Icon name="image" size={18} />
          </button>
          <span className="composer__spacer" />
          <CharGauge used={text.length} />
          <span className={canSend ? "btn-glow" : undefined}>
            <button type="submit" className="btn btn--primary" disabled={!canSend}>
              <Icon name="send" size={14} />
              {createPost.isPending ? "Sending" : "Transmit"}
            </button>
          </span>
        </div>
      </div>
    </form>
  );
}
