import { useEffect, useId, useRef } from "react";
import Icon from "./Icon.jsx";

// The native <dialog> provides the focus trap, Esc to close and the top layer.
export default function Dialog({ title, eyebrow, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    const previouslyFocused = document.activeElement;
    if (!dialog.open) dialog.showModal();
    return () => previouslyFocused?.focus?.();
  }, []);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId} onClose={onClose}>
      <div className="dialog__panel hull">
        <header className="dialog__head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id={titleId} className="dialog__title">
              {title}
            </h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
