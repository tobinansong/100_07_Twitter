import { useStampClock } from "../lib/clock.js";
import { formatFullDate, missionTime, spokenTime } from "../lib/format.js";

export default function Stamp({ iso }) {
  const now = useStampClock();
  return (
    <time className="stamp" dateTime={iso} title={formatFullDate(iso)}>
      <span aria-hidden="true">{missionTime(iso, now)}</span>
      <span className="sr-only">{spokenTime(iso, now)}</span>
    </time>
  );
}
