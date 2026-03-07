import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Auth Queries ─────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalStudents: bigint; totalTeachers: bigint }>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return { totalStudents: BigInt(0), totalTeachers: BigInt(0) };
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Auth Mutations ───────────────────────────────────────────────────────────

export function useLogin() {
  const { actor } = useActor();
  return useMutation<
    string | null,
    Error,
    { username: string; password: string }
  >({
    mutationFn: async ({ username, password }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.login(username, password);
    },
  });
}

export function useLogout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (token: string) => {
      if (!actor) return;
      await actor.logout(token);
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSeedDemoUsers() {
  const { actor } = useActor();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) return;
      await actor.seedDemoUsers();
    },
  });
}
