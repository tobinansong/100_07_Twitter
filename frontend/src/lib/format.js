const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const fullDate = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" });
const monthYear = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export function formatCount(value) {
  return compact.format(value);
}

// Elapsed time as a mission clock reads it: T+14M, T+2H 14M, T+6D 3H.
export function missionTime(iso, now) {
  const elapsed = now - new Date(iso).getTime();
  if (elapsed < MINUTE) return "T+NOW";
  if (elapsed < HOUR) return `T+${Math.floor(elapsed / MINUTE)}M`;
  if (elapsed < DAY) {
    return `T+${Math.floor(elapsed / HOUR)}H ${Math.floor((elapsed % HOUR) / MINUTE)}M`;
  }
  if (elapsed < 30 * DAY) {
    return `T+${Math.floor(elapsed / DAY)}D ${Math.floor((elapsed % DAY) / HOUR)}H`;
  }
  return iso.slice(0, 10).replaceAll("-", ".");
}

// The same elapsed time in plain words, for screen readers.
export function spokenTime(iso, now) {
  const elapsed = now - new Date(iso).getTime();
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), "minute");
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), "hour");
  return relative.format(-Math.floor(elapsed / DAY), "day");
}

export function formatFullDate(iso) {
  return fullDate.format(new Date(iso));
}

export function formatMonthYear(iso) {
  return monthYear.format(new Date(iso));
}

export function formatUtcClock(now) {
  return new Date(now).toISOString().slice(11, 19);
}

// Profile links are free text, so only http(s) URLs ever become clickable.
export function toSafeUrl(value) {
  if (!value) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function displayUrl(href) {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function profilePath(username) {
  return `/profile/${encodeURIComponent(username)}`;
}

export function initialsOf(user) {
  const source = user?.fullName || user?.username || "?";
  const words = source.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}
