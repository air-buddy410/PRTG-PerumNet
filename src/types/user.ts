export type UserRole = "admin" | "noc" | "engineer" | "manajemen";

export type UserStatus = "active" | "pending";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin NOC",
  noc: "NOC",
  engineer: "Engineer",
  manajemen: "Manajemen",
};
