import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { getSeen, setSeen, subscribeSeen } from "../lib/notificationsSeen.js";
import { pushToast } from "../lib/toast.js";
import { useAuthUser } from "./useAuth.js";

const NOTIFICATIONS_KEY = ["notifications"];
const POLL_INTERVAL = 30_000;
const NO_NOTIFICATIONS = [];

// Timers belong to each observer, so only the app shell polls (`poll: true`).
export function useNotifications({ poll = false } = {}) {
  const { data: me } = useAuthUser();
  const userId = me?._id;

  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => api("/notifications"),
    refetchInterval: poll ? POLL_INTERVAL : false,
    enabled: Boolean(userId),
  });

  const seen = useSyncExternalStore(subscribeSeen, () => (userId ? getSeen(userId) : ""));

  // A notification can outlive the account that sent it.
  const notifications = useMemo(
    () => (query.data ?? NO_NOTIFICATIONS).filter((item) => item.from),
    [query.data]
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.createdAt > seen).length,
    [notifications, seen]
  );

  const markSeen = useCallback(
    (createdAt) => {
      if (userId && createdAt > getSeen(userId)) setSeen(userId, createdAt);
    },
    [userId]
  );

  return { query, notifications, unreadCount, seen, markSeen };
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api("/notifications", { method: "DELETE" }),
    onSuccess: () => queryClient.setQueryData(NOTIFICATIONS_KEY, []),
    onError: (error) => pushToast(error.message, "error"),
  });
}
