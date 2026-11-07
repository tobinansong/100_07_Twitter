import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { AUTH_KEY, endSession } from "../lib/queryClient.js";
import { pushToast } from "../lib/toast.js";

// A 401 here isn't an error. It just means nobody is logged in.
async function fetchAuthUser() {
  try {
    return await api("/auth/me");
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function useAuthUser() {
  return useQuery({ queryKey: AUTH_KEY, queryFn: fetchAuthUser, staleTime: 5 * 60_000 });
}

function useSessionStart(path) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => api(path, { method: "POST", body: fields }),
    onSuccess: (user) => {
      endSession(queryClient);
      queryClient.setQueryData(AUTH_KEY, user);
    },
  });
}

export function useLogin() {
  return useSessionStart("/auth/login");
}

export function useSignup() {
  return useSessionStart("/auth/signup");
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api("/auth/logout", { method: "POST" }),
    onSuccess: () => endSession(queryClient),
    onError: (error) => pushToast(error.message, "error"),
  });
}
