import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import Avatar from "../components/Avatar.jsx";
import EditProfileDialog from "../components/EditProfileDialog.jsx";
import FollowButton from "../components/FollowButton.jsx";
import Icon from "../components/Icon.jsx";
import OrbitCover from "../components/OrbitCover.jsx";
import PostList from "../components/PostList.jsx";
import { EmptyPanel, ErrorPanel, ScanRows } from "../components/states.jsx";
import Tabs from "../components/Tabs.jsx";
import { useAuthUser } from "../hooks/useAuth.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useFeed } from "../hooks/usePosts.js";
import { useProfile } from "../hooks/useUsers.js";
import { displayUrl, formatCount, formatMonthYear, profilePath, toSafeUrl } from "../lib/format.js";
import { pushToast } from "../lib/toast.js";

function Readout({ label, value }) {
  return (
    <div className="readout">
      <dt className="eyebrow">{label}</dt>
      <dd className="readout__value">{value === undefined ? "--" : formatCount(value)}</dd>
    </div>
  );
}

function ProfileHeader({ profile, isMe, postCount, onEdit }) {
  const href = toSafeUrl(profile.link);

  return (
    <section className="profile" aria-label={`${profile.fullName}'s profile`}>
      <div className="profile__cover">
        {profile.coverImg ? <img src={profile.coverImg} alt="" /> : <OrbitCover seed={profile._id} />}
      </div>

      <div className="profile__bar">
        <Avatar user={profile} size="xl" />
        {isMe ? (
          <button type="button" className="btn btn--ghost" onClick={onEdit}>
            <Icon name="pencil" size={14} />
            Edit profile
          </button>
        ) : (
          <FollowButton userId={profile._id} name={profile.fullName} />
        )}
      </div>

      <div className="profile__id">
        <h1 className="profile__name">{profile.fullName}</h1>
        <p className="profile__handle">@{profile.username}</p>
        {profile.bio && <p className="profile__bio">{profile.bio}</p>}

        <ul className="profile__meta">
          {href && (
            <li>
              <Icon name="link" size={14} />
              <a href={href} target="_blank" rel="noopener noreferrer nofollow">
                {displayUrl(href)}
              </a>
            </li>
          )}
          {profile.createdAt && (
            <li>
              <Icon name="calendar" size={14} />
              Joined {formatMonthYear(profile.createdAt)}
            </li>
          )}
        </ul>
      </div>

      <dl className="readouts">
        <Readout label="Posts" value={postCount} />
        <Readout label="Following" value={profile.following.length} />
        <Readout label="Followers" value={profile.followers.length} />
      </dl>
    </section>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(false);
  const { data: me } = useAuthUser();

  const profileQuery = useProfile(username);
  const profile = profileQuery.data;
  const tab = params.get("tab") === "likes" ? "likes" : "posts";

  const postsQuery = useFeed({ type: "user", username });
  const likesQuery = useFeed(
    { type: "likes", userId: profile?._id },
    { enabled: Boolean(profile) && tab === "likes" }
  );

  useDocumentTitle(profile ? `${profile.fullName} (@${profile.username})` : "Profile");

  function selectTab(next) {
    setParams(next === "posts" ? {} : { tab: next }, { replace: true });
  }

  function handleSaved(user) {
    setEditing(false);
    pushToast("Profile updated.");
    if (user.username !== username) navigate(profilePath(user.username), { replace: true });
  }

  if (profileQuery.isPending) return <ScanRows rows={3} label="Loading profile" />;

  if (profileQuery.isError) {
    if (profileQuery.error.status === 404) {
      return (
        <EmptyPanel
          title="No signal at that callsign"
          action={
            <Link to="/" className="btn btn--ghost">
              Back to home
            </Link>
          }
        >
          There's nobody called @{username} on the network.
        </EmptyPanel>
      );
    }
    return <ErrorPanel message={profileQuery.error.message} onRetry={profileQuery.refetch} />;
  }

  const isMe = profile._id === me?._id;
  const tabs = [
    { value: "posts", label: "Posts" },
    { value: "likes", label: "Likes", count: formatCount(profile.likedPosts?.length ?? 0) },
  ];

  return (
    <>
      <ProfileHeader
        profile={profile}
        isMe={isMe}
        postCount={postsQuery.data?.length}
        onEdit={() => setEditing(true)}
      />

      <div className="pane-head pane-head--tabs">
        <Tabs items={tabs} value={tab} onChange={selectTab} label="Choose what to show" />
      </div>

      {tab === "posts" ? (
        <PostList
          query={postsQuery}
          label={`Posts by ${profile.fullName}`}
          empty={
            <EmptyPanel title="No transmissions">
              {isMe ? "You haven't posted anything yet." : `@${profile.username} hasn't posted anything yet.`}
            </EmptyPanel>
          }
        />
      ) : (
        <PostList
          query={likesQuery}
          label={`Posts liked by ${profile.fullName}`}
          empty={
            <EmptyPanel title="No likes logged">
              {isMe ? "Posts you like will appear here." : `@${profile.username} hasn't liked anything yet.`}
            </EmptyPanel>
          }
        />
      )}

      {editing && isMe && (
        <EditProfileDialog me={me} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}
    </>
  );
}
