import { api } from "./api";
import type {
  AdminUserListItem,
  AdminUserDetail,
  CreateAdminUserRequest,
  UpdateAdminStatusRequest,
  ResetAdminPasswordRequest,
} from "@/types/adminUser";

export const adminUsersApi = {
  /**
   * Tüm admin kullanıcılarını listele
   * GET /api/admin/users
   */
  list() {
    return api.get<AdminUserListItem[]>("/api/admin/users");
  },

  /**
   * Tek bir admin kullanıcı detayı
   * GET /api/admin/users/{id}
   */
  getById(id: string) {
    return api.get<AdminUserDetail>(`/api/admin/users/${id}`);
  },

  /**
   * Yeni admin kullanıcı oluştur
   * POST /api/admin/users
   */
  create(body: CreateAdminUserRequest) {
    return api.post<AdminUserListItem>("/api/admin/users", body);
  },

  /**
   * Aktif/pasif durumu değiştir
   * PATCH /api/admin/users/{id}/status
   */
  updateStatus(id: string, body: UpdateAdminStatusRequest) {
    return api.patch<AdminUserListItem>(
      `/api/admin/users/${id}/status`,
      body
    );
  },

  /**
   * Parola sıfırla
   * POST /api/admin/users/{id}/reset-password
   */
  resetPassword(id: string, body: ResetAdminPasswordRequest) {
    return api.post<{ message: string }>(
      `/api/admin/users/${id}/reset-password`,
      body
    );
  },
};