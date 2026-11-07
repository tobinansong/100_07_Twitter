import { useSyncExternalStore } from "react";
import { dismissToast, toastStore } from "../lib/toast.js";
import Icon from "./Icon.jsx";

export default function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone} hull`}>
          <span className="toast__mark" aria-hidden="true" />
          <p className="toast__text">{toast.message}</p>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            aria-label="Dismiss"
            onClick={() => dismissToast(toast.id)}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
