import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const AUTH_KEY = ["authUser"];

// Drops everything cached for the previous session, so one account can't see another's data.
export function endSession(client) {
  client.setQueryData(AUTH_KEY, null);
  client.removeQueries({ predicate: (query) => query.queryKey[0] !== AUTH_KEY[0] });
}

// A 401 from any request means the session expired, which sends the app back to login.
function handleSessionLoss(error) {
  if (error?.status === 401) endSession(queryClient);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleSessionLoss }),
  mutationCache: new MutationCache({ onError: handleSessionLoss }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Client errors won't change on retry. Give server and network errors one more try.
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});
