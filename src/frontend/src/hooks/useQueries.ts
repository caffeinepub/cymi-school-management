import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolRole, type UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Demo Credentials ─────────────────────────────────────────────────────────

const DEMO_USERS: Record<
  string,
  { password: string; profile: Omit<UserProfile, "username"> }
> = {
  superadmin: {
    password: "superadmin123",
    profile: {
      firstName: "Super",
      lastName: "Admin",
      schoolRole: "SuperAdmin" as SchoolRole,
    },
  },
  admin: {
    password: "admin123",
    profile: {
      firstName: "Admin",
      lastName: "User",
      schoolRole: SchoolRole.Admin,
    },
  },
  parent1: {
    password: "parent123",
    profile: {
      firstName: "Priya",
      lastName: "Sharma",
      schoolRole: "Parent" as SchoolRole,
    },
  },
  student1: {
    password: "student123",
    profile: {
      firstName: "Alice",
      lastName: "Brown",
      schoolRole: SchoolRole.Student,
    },
  },
};

// ─── Auth Queries ─────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      const raw = localStorage.getItem("cymi_profile");
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as {
          firstName: string;
          lastName: string;
          username: string;
          schoolRole: string;
        };
        return {
          firstName: parsed.firstName,
          lastName: parsed.lastName,
          username: parsed.username,
          schoolRole: parsed.schoolRole as SchoolRole,
        } satisfies UserProfile;
      } catch {
        return null;
      }
    },
  });
}

export function useDashboardStats() {
  return useQuery<{ totalStudents: bigint; totalTeachers: bigint }>({
    queryKey: ["dashboardStats"],
    queryFn: async () => ({
      totalStudents: BigInt(520),
      totalTeachers: BigInt(15),
    }),
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
      // 1. Check demo credentials first
      const demo = DEMO_USERS[username];
      if (demo && demo.password === password) {
        const token = `demo-${username}-${Date.now()}`;
        const profile: UserProfile = {
          username,
          ...demo.profile,
        };
        localStorage.setItem("cymi_profile", JSON.stringify(profile));
        return token;
      }

      // 2. Fall back to backend login
      if (!actor) return null;
      try {
        return await actor.login(username, password);
      } catch {
        return null;
      }
    },
  });
}

export function useLogout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (token: string) => {
      localStorage.removeItem("cymi_profile");
      if (!actor) return;
      try {
        await actor.logout(token);
      } catch {
        // ignore backend logout errors
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useSeedDemoUsers() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      // No-op: demo users are handled client-side
    },
  });
}
