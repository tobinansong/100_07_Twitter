import { useEffect, useState } from "react";
import { Link } from "react-router";
import Avatar from "../components/Avatar.jsx";
import Icon from "../components/Icon.jsx";
import Stamp from "../components/Stamp.jsx";
import { EmptyPanel, ErrorPanel, ScanRows } from "../components/states.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useClearNotifications, useNotifications } from "../hooks/useNotifications.js";
import { profilePath } from "../lib/format.js";

const COPY = {
  follow: { icon: "follow", text: "started following you" },
  like: { icon: "heart", text: "liked your post" },
};

export default function NotificationsPage() {
  useDocumentTitle("Alerts");
  const { query, notifications, seen, markSeen } = useNotifications();
  const clear = useClearNotifications();
  const [confirming, setConfirming] = useState(false);
  // Fixed when the page opens, so new items stay highlighted while the badge clears.
  const [baseline] = useState(seen);

  const { refetch } = query;
  useEffect(() => {
    refetch();
  }, [refetch]);

  const newest = notifications[0]?.createdAt;
  useEffect(() => {
    if (newest) markSeen(newest);
  }, [newest, markSeen]);

  function clearAll() {
    clear.mutate(undefined, { onSettled: () => setConfirming(false) });
  }

  return (
    <>
      <header className="pane-head pane-head--row">
        <h1 className="page-title">Alerts</h1>
        {notifications.length > 0 &&
          (confirming ? (
            <span className="post__confirm">
              <span className="eyebrow">Clear all?</span>
              <button type="button" className="btn btn--sm btn--danger" disabled={clear.isPending} onClick={clearAll}>
                {clear.isPending ? "Clearing" : "Clear"}
              </button>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirming(true)}>
              <Icon name="trash" size={14} />
              Clear all
            </button>
          ))}
      </header>

      {query.isPending && <ScanRows label="Loading alerts" />}

      {query.isError && !query.data && (
        <ErrorPanel message={query.error.message} onRetry={query.refetch} />
      )}

      {query.data && notifications.length === 0 && (
        <EmptyPanel title="All quiet">When someone follows you or likes your post, it appears here.</EmptyPanel>
      )}

      {notifications.length > 0 && (
        <ol className="alerts">
          {notifications.map((item) => {
            const copy = COPY[item.type];
            const isNew = item.createdAt > baseline;
            return (
              <li key={item._id} className={`alert${isNew ? " is-new" : ""}`}>
                <span className={`alert__icon alert__icon--${item.type}`} aria-hidden="true">
                  <Icon name={copy.icon} size={16} />
                </span>
                <Link to={profilePath(item.from.username)} className="alert__who">
                  <Avatar user={item.from} size="sm" />
                  <span className="alert__text">
                    <strong>@{item.from.username}</strong> {copy.text}
                  </span>
                </Link>
                <span className="alert__meta">
                  {isNew && <span className="alert__new">New</span>}
                  <Stamp iso={item.createdAt} />
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
