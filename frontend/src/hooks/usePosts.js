import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { AUTH_KEY } from "../lib/queryClient.js";
import { pushToast } from "../lib/toast.js";

const POSTS_KEY = ["posts"];

function feedRequest(feed) {
  switch (feed.type) {
    case "following":
      return { key: [...POSTS_KEY, "following"], path: "/posts/following" };
    case "user":
      return {
        key: [...POSTS_KEY, "user", feed.username],
        path: `/posts/user/${encodeURIComponent(feed.username)}`,
      };
    case "likes":
      return { key: [...POSTS_KEY, "likes", feed.userId], path: `/posts/likes/${feed.userId}` };
    default:
      return { key: [...POSTS_KEY, "all"], path: "/posts/all" };
  }
}

// populate() returns a null author if that account no longer exists.
const withAuthors = (posts) => posts.filter((post) => post.user);

export function useFeed(feed, { enabled = true } = {}) {
  const { key, path } = feedRequest(feed);
  return useQuery({ queryKey: key, queryFn: () => api(path), enabled, select: withAuthors });
}

function patchPost(queryClient, postId, update) {
  queryClient.setQueriesData({ queryKey: POSTS_KEY }, (posts) =>
    posts?.map((post) => (post._id === postId ? update(post) : post))
  );
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => api("/posts/create", { method: "POST", body: fields }),
    onSuccess: (post) => {
      // The response has only the author's id, and the feeds need the full user.
      const me = queryClient.getQueryData(AUTH_KEY);
      const prepend = (posts) => (posts ? [{ ...post, user: me }, ...posts] : posts);
      queryClient.setQueryData([...POSTS_KEY, "all"], prepend);
      queryClient.setQueryData([...POSTS_KEY, "user", me.username], prepend);
      return queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
    onError: (error) => pushToast(error.message, "error"),
  });
}

export function useLikePost(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api(`/posts/like/${postId}`, { method: "POST" }),
    // The API toggles, so rapid taps on one post have to reach it in order.
    scope: { id: `like-${postId}` },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: POSTS_KEY });
      const myId = queryClient.getQueryData(AUTH_KEY)?._id;
      patchPost(queryClient, postId, (post) => ({
        ...post,
        likes: post.likes.includes(myId)
          ? post.likes.filter((id) => id !== myId)
          : [...post.likes, myId],
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...POSTS_KEY, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      pushToast(error.message, "error");
      queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
  });
}

export function useCommentOnPost(postId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => api(`/posts/comment/${postId}`, { method: "POST", body: { text } }),
    onSuccess: (updatedPost) => {
      // Comment authors come back as bare ids, so fill in the user for the new one.
      const me = queryClient.getQueryData(AUTH_KEY);
      const saved = updatedPost.comments.at(-1);
      patchPost(queryClient, postId, (post) => ({
        ...post,
        comments: [...post.comments, { ...saved, user: me }],
      }));
      return queryClient.invalidateQueries({ queryKey: POSTS_KEY });
    },
    onError: (error) => pushToast(error.message, "error"),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId) => api(`/posts/${postId}`, { method: "DELETE" }),
    onSuccess: (_result, postId) => {
      queryClient.setQueriesData({ queryKey: POSTS_KEY }, (posts) =>
        posts?.filter((post) => post._id !== postId)
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      pushToast("Post deleted.");
    },
    onError: (error) => pushToast(error.message, "error"),
  });
}
