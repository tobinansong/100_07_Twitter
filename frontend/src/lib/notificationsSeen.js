// GET /api/notifications marks everything as read on the server, so polling it for a
// badge would use up the `read` flag before anyone saw it. Unread state is tracked here
// instead: the newest notification's createdAt that this browser has shown.
const memory = new Map();
const listeners = new Set();

const storageKey = (userId) => `perigee:notifications-seen:${userId}`;

export function getSeen(userId) {
  if (memory.has(userId)) return memory.get(userId);
  let stored = "";
  try {
    stored = localStorage.getItem(storageKey(userId)) ?? "";
  } catch {
    // Storage can be blocked. The value then only lasts until the page reloads.
  }
  memory.set(userId, stored);
  return stored;
}

export function setSeen(userId, createdAt) {
  memory.set(userId, createdAt);
  try {
    localStorage.setItem(storageKey(userId), createdAt);
  } catch {
    // See getSeen.
  }
  listeners.forEach((notify) => notify());
}

export function subscribeSeen(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keeps the badge in step when notifications are opened in another tab.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (!event.key?.startsWith("perigee:notifications-seen:")) return;
    memory.clear();
    listeners.forEach((notify) => notify());
  });
}
