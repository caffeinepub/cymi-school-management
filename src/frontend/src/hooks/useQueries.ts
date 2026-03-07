import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolRole, type UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Demo Credentials ─────────────────────────────────────────────────────────

const DEMO_USERS: Record<
  string,
  { password: string; profile: Omit<UserProfile, "username"> }
> = {
  admin: {
    password: "admin123",
    profile: {
      firstName: "Admin",
      lastName: "User",
      schoolRole: SchoolRole.Admin,
    },
  },
  teacher1: {
    password: "teacher123",
    profile: {
      firstName: "John",
      lastName: "Smith",
      schoolRole: SchoolRole.Teacher,
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

function parseSchoolRole(role: string): SchoolRole {
  switch (role) {
    case "Admin":
      return SchoolRole.Admin;
    case "Teacher":
      return SchoolRole.Teacher;
    case "Student":
      return SchoolRole.Student;
    default:
      return SchoolRole.Student;
  }
}

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
          schoolRole: parseSchoolRole(parsed.schoolRole),
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
      totalStudents: BigInt(120),
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
