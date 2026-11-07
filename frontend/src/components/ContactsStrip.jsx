import { Link } from "react-router";
import { useSuggestedUsers } from "../hooks/useUsers.js";
import { profilePath } from "../lib/format.js";
import Avatar from "./Avatar.jsx";
import FollowButton from "./FollowButton.jsx";

// The compact version for screens too narrow for the radar column. CSS shows only one of the two.
export default function ContactsStrip() {
  const { data: users } = useSuggestedUsers();
  if (!users?.length) return null;

  return (
    <section className="strip" aria-labelledby="strip-title">
      <h2 id="strip-title" className="eyebrow strip__title">
        Contacts in range
      </h2>
      <ul className="strip__list">
        {users.map((user) => (
          <li key={user._id} className="strip__item">
            <Link to={profilePath(user.username)} className="strip__who">
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
    </section>
  );
}
