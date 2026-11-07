import { useSyncExternalStore } from "react";

// One shared timer per interval, however many components read the time.
function createClock(intervalMs) {
  let now = Date.now();
  let timer = null;
  const listeners = new Set();

  function subscribe(listener) {
    listeners.add(listener);
    if (timer === null) {
      now = Date.now();
      timer = setInterval(() => {
        now = Date.now();
        listeners.forEach((notify) => notify());
      }, intervalMs);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        clearInterval(timer);
        timer = null;
      }
    };
  }

  return { subscribe, getSnapshot: () => now };
}

const secondClock = createClock(1_000);
const stampClock = createClock(30_000);

export function useSecondClock() {
  return useSyncExternalStore(secondClock.subscribe, secondClock.getSnapshot);
}

export function useStampClock() {
  return useSyncExternalStore(stampClock.subscribe, stampClock.getSnapshot);
}
