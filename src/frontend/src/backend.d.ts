import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DemiUser {
    id: bigint;
    role: UserRole;
    lastName: string;
    firstName: string;
}
export interface UserProfile {
    schoolRole: SchoolRole;
    username: string;
    lastName: string;
    firstName: string;
}
export interface Student {
    id: bigint;
    dob: string;
    joinDate: string;
    feeStatus: string;
    parentPhone: string;
    section: string;
    email: string;
    attendancePct: bigint;
    grade: bigint;
    address: string;
    gender: string;
    admissionNo: string;
    phone: string;
    lastName: string;
    parentName: string;
    firstName: string;
}
export enum SchoolRole {
    Teacher = "Teacher",
    Student = "Student",
    Admin = "Admin"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDemiUser(id: bigint, firstName: string, lastName: string, role: UserRole): Promise<DemiUser>;
    addStudent(student: Student): Promise<Student>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudent(id: bigint): Promise<void>;
    getAllStudents(): Promise<Array<Student>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<{
        totalStudents: bigint;
        totalTeachers: bigint;
    }>;
    getDemiUserById(id: bigint): Promise<DemiUser | null>;
    getStudentById(id: bigint): Promise<Student | null>;
    getStudentCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(username: string, password: string): Promise<string | null>;
    logout(token: string): Promise<void>;
    removeDemiUser(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedDemoUsers(): Promise<void>;
    seedStudents(studentSeed: Array<Student>): Promise<void>;
    totalDemiUsers(): Promise<bigint>;
    updateDemiUser(id: bigint, firstName: string, lastName: string, role: UserRole): Promise<DemiUser>;
    updateStudent(student: Student): Promise<Student>;
    validateToken(token: string): Promise<Principal | null>;
}
