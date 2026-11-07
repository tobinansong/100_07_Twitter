import { useState } from "react";
import { Link } from "react-router";
import { useAuthUser } from "../hooks/useAuth.js";
import { useDeletePost, useLikePost } from "../hooks/usePosts.js";
import { formatCount, profilePath } from "../lib/format.js";
import Avatar from "./Avatar.jsx";
import CommentThread from "./CommentThread.jsx";
import Icon from "./Icon.jsx";
import Stamp from "./Stamp.jsx";

export default function PostCard({ post, index }) {
  const { data: me } = useAuthUser();
  const like = useLikePost(post._id);
  const deletePost = useDeletePost();
  const [threadOpen, setThreadOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [burst, setBurst] = useState(0);

  const author = post.user;
  const liked = post.likes.includes(me?._id);
  const mine = author._id === me?._id;
  const authorPath = profilePath(author.username);

  function toggleLike() {
    if (!liked) setBurst((count) => count + 1);
    like.mutate();
  }

  return (
    <li className="post" style={{ "--i": Math.min(index, 8) }}>
      <article className="post__frame">
        {/* The name link below offers the same destination to keyboard and screen readers. */}
        <Link to={authorPath} className="post__avatar" tabIndex={-1} aria-hidden="true">
          <Avatar user={author} />
        </Link>

        <div className="post__body">
          <header className="post__head">
            <Link to={authorPath} className="post__who">
              <span className="post__name">{author.fullName}</span>
              <span className="post__handle">@{author.username}</span>
            </Link>
            <Stamp iso={post.createdAt} />
          </header>

          {post.text && <p className="post__text">{post.text}</p>}

          {post.img && (
            <div className="post__media">
              <img src={post.img} alt={`Attached by ${author.fullName}`} loading="lazy" decoding="async" />
            </div>
          )}

          <footer className="post__actions">
            <button
              type="button"
              className={`act act--like${liked ? " is-on" : ""}`}
              aria-pressed={liked}
              aria-label={`Like, ${post.likes.length} ${post.likes.length === 1 ? "like" : "likes"}`}
              onClick={toggleLike}
            >
              <span className="act__icon">
                <Icon name="heart" size={17} />
                {burst > 0 && <span key={burst} className="act__burst" aria-hidden="true" />}
              </span>
              <span>{formatCount(post.likes.length)}</span>
            </button>

            <button
              type="button"
              className={`act act--reply${threadOpen ? " is-on" : ""}`}
              aria-expanded={threadOpen}
              aria-label={`Replies, ${post.comments.length}`}
              onClick={() => setThreadOpen((open) => !open)}
            >
              <span className="act__icon">
                <Icon name="reply" size={17} />
              </span>
              <span>{formatCount(post.comments.length)}</span>
            </button>

            <span className="post__spacer" />

            {mine && !confirmingDelete && (
              <button
                type="button"
                className="act act--danger"
                aria-label="Delete post"
                onClick={() => setConfirmingDelete(true)}
              >
                <span className="act__icon">
                  <Icon name="trash" size={16} />
                </span>
              </button>
            )}

            {mine && confirmingDelete && (
              <span className="post__confirm">
                <span className="eyebrow">Delete?</span>
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  disabled={deletePost.isPending}
                  onClick={() => deletePost.mutate(post._id)}
                >
                  {deletePost.isPending ? "Deleting" : "Delete"}
                </button>
                <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirmingDelete(false)}>
                  Keep
                </button>
              </span>
            )}
          </footer>

          {threadOpen && <CommentThread post={post} />}
        </div>
      </article>
    </li>
  );
}
