const MAX_VISIBLE = 3;
const DURATION = { info: 3500, error: 6500 };

let toasts = [];
let nextId = 1;
const listeners = new Set();

function publish(next) {
  toasts = next;
  listeners.forEach((notify) => notify());
}

export function dismissToast(id) {
  publish(toasts.filter((toast) => toast.id !== id));
}

export function pushToast(message, tone = "info") {
  const toast = { id: nextId, message, tone };
  nextId += 1;
  publish([...toasts.slice(-(MAX_VISIBLE - 1)), toast]);
  setTimeout(() => dismissToast(toast.id), DURATION[tone]);
}

export const toastStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
};
