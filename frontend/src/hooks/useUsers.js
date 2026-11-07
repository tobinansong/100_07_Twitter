import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { AUTH_KEY } from "../lib/queryClient.js";
import { pushToast } from "../lib/toast.js";

const toggled = (ids, id) =>
  ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];

export function useProfile(username) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => api(`/users/profile/${encodeURIComponent(username)}`),
  });
}

// The API returns a random sample each time, so refetching on its own would reshuffle
// the list while someone is reading it. It only refreshes when asked to.
export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggested"],
    queryFn: () => api("/users/suggested"),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api(`/users/follow/${userId}`, { method: "POST" }),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const me = queryClient.getQueryData(AUTH_KEY);
      queryClient.setQueryData(AUTH_KEY, { ...me, following: toggled(me.following, userId) });
      queryClient.setQueriesData({ queryKey: ["profile"] }, (profile) => {
        if (profile?._id === userId) {
          return { ...profile, followers: toggled(profile.followers, me._id) };
        }
        if (profile?._id === me._id) {
          return { ...profile, following: toggled(profile.following, userId) };
        }
        return profile;
      });
      return { previousMe: me };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts", "following"] });
    },
    onError: (error, _userId, context) => {
      if (context?.previousMe) queryClient.setQueryData(AUTH_KEY, context.previousMe);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      pushToast(error.message, "error");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => api("/users/update", { method: "POST", body: fields }),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_KEY, user);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Every post carries a copy of its author's name and images.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
