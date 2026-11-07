import { useAuthUser } from "../hooks/useAuth.js";
import { useFollow } from "../hooks/useUsers.js";

export default function FollowButton({ userId, small = false, name }) {
  const { data: me } = useAuthUser();
  const follow = useFollow();
  const following = Boolean(me?.following?.includes(userId));

  const tone = following ? "btn--ghost" : small ? "btn--hot" : "btn--primary";
  const classes = ["btn", tone, small && "btn--sm"].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={following}
      aria-label={name ? `${following ? "Following" : "Follow"} ${name}` : undefined}
      disabled={follow.isPending}
      onClick={() => follow.mutate(userId)}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
