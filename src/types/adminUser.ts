export type AdminRole = "SuperAdmin" | "CallCenter" | "ReadOnly" | "BlogEditor";

export interface AdminUserListItem {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: AdminRole;
}

export interface UpdateAdminStatusRequest {
  isActive: boolean;
}

export interface ResetAdminPasswordRequest {
  newPassword: string;
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SuperAdmin: "Süper Admin",
  CallCenter: "Çağrı Merkezi",
  ReadOnly: "Salt Okunur",
  BlogEditor: "Blog Editörü",
};

export const ROLE_OPTIONS: { value: AdminRole; label: string }[] = [
  { value: "SuperAdmin", label: "Süper Admin" },
  { value: "CallCenter", label: "Çağrı Merkezi" },
  { value: "ReadOnly", label: "Salt Okunur" },
  { value: "BlogEditor", label: "Blog Editörü" },
];