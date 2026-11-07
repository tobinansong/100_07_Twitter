import { useState } from "react";
import { Link } from "react-router";
import { useAuthUser } from "../hooks/useAuth.js";
import { useCommentOnPost } from "../hooks/usePosts.js";
import { profilePath } from "../lib/format.js";
import Avatar from "./Avatar.jsx";
import Icon from "./Icon.jsx";

const MAX_CHARS = 280;

export default function CommentThread({ post }) {
  const { data: me } = useAuthUser();
  const comment = useCommentOnPost(post._id);
  const [text, setText] = useState("");
  const trimmed = text.trim();

  function submit(event) {
    event.preventDefault();
    if (!trimmed || comment.isPending) return;
    comment.mutate(trimmed, { onSuccess: () => setText("") });
  }

  return (
    <div className="thread">
      {post.comments.length > 0 && (
        <ul className="thread__list">
          {post.comments.map((item) => (
            <li className="thread__item" key={item._id}>
              <Avatar user={item.user} size="xs" />
              <div className="thread__body">
                {item.user ? (
                  <Link className="thread__who" to={profilePath(item.user.username)}>
                    {item.user.fullName}
                    <span className="post__handle">@{item.user.username}</span>
                  </Link>
                ) : (
                  <span className="thread__who">Deleted account</span>
                )}
                <p className="thread__text">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="thread__form" onSubmit={submit}>
        <Avatar user={me} size="xs" />
        <label className="sr-only" htmlFor={`reply-${post._id}`}>
          Reply to {post.user.username}
        </label>
        <input
          id={`reply-${post._id}`}
          className="input input--inline"
          placeholder={`Reply to @${post.user.username}`}
          maxLength={MAX_CHARS}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          type="submit"
          className="icon-btn icon-btn--hot"
          aria-label="Send reply"
          disabled={!trimmed || comment.isPending}
        >
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  );
}
