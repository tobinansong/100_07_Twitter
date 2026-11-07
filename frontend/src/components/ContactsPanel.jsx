import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useSuggestedUsers } from "../hooks/useUsers.js";
import { profilePath } from "../lib/format.js";
import { hashString, seededRandom } from "../lib/seed.js";
import Avatar from "./Avatar.jsx";
import FollowButton from "./FollowButton.jsx";
import Icon from "./Icon.jsx";
import RadarScope from "./RadarScope.jsx";

// Spreads contacts evenly around the scope, then offsets each one using its id, so
// blips don't overlap and a person keeps roughly the same spot.
function plotContacts(users) {
  const sector = 360 / Math.max(users.length, 1);
  return users.map((user, index) => {
    const random = seededRandom(hashString(user._id));
    const bearing = (index * sector + 18 + random() * sector * 0.6) % 360;
    const range = 0.4 + random() * 0.42;
    const radians = (bearing * Math.PI) / 180;
    return {
      user,
      code: String(index + 1).padStart(2, "0"),
      bearing,
      x: Math.sin(radians) * range,
      y: -Math.cos(radians) * range,
    };
  });
}

export default function ContactsPanel() {
  const { data: users, isPending, isError, isFetching, refetch } = useSuggestedUsers();
  const [activeId, setActiveId] = useState(null);
  const contacts = useMemo(() => plotContacts(users ?? []), [users]);

  return (
    <section className="contacts hull" aria-labelledby="contacts-title">
      <header className="contacts__head">
        <div>
          <h2 id="contacts-title" className="contacts__title">
            Contacts
          </h2>
          <p className="eyebrow">{isPending ? "Scanning" : `${contacts.length} in range`}</p>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label="Scan for new contacts"
          title="Scan for new contacts"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <span className={isFetching ? "spin" : undefined}>
            <Icon name="refresh" size={16} />
          </span>
        </button>
      </header>

      <RadarScope fast={isFetching} className="contacts__radar">
        {contacts.map(({ user, code, bearing, x, y }) => (
          <Link
            key={user._id}
            to={profilePath(user.username)}
            className={`blip${activeId === user._id ? " is-active" : ""}`}
            style={{ "--x": x, "--y": y, "--turn": bearing / 360 }}
            tabIndex={-1}
            aria-hidden="true"
            onMouseEnter={() => setActiveId(user._id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <span className="blip__dot" />
            <span className="blip__code">{code}</span>
          </Link>
        ))}
      </RadarScope>

      {isError && (
        <p className="contacts__note" role="alert">
          Couldn't scan for contacts. Try again.
        </p>
      )}

      {!isPending && !isError && contacts.length === 0 && (
        <p className="contacts__note">Nobody else is in range yet.</p>
      )}

      {contacts.length > 0 && (
        <ul className="contacts__list">
          {contacts.map(({ user, code }) => (
            <li
              key={user._id}
              className={`contact${activeId === user._id ? " is-active" : ""}`}
              onMouseEnter={() => setActiveId(user._id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <span className="contact__code" aria-hidden="true">
                {code}
              </span>
              <Link to={profilePath(user.username)} className="contact__who">
                <Avatar user={user} size="sm" />
                <span className="contact__names">
                  <span className="contact__name">{user.fullName}</span>
                  <span className="post__handle">@{user.username}</span>
                </span>
              </Link>
              <FollowButton userId={user._id} name={user.fullName} small />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
