import { api } from "./api";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminMeResponse,
  AdminRefreshResponse,
  AdminSetup2FaRequest,
  AdminSetup2FaResponse,
  AdminVerify2FaRequest,
} from "@/types/admin";

const BASE = "/api/admin/auth";

export const authApi = {
  login(body: AdminLoginRequest) {
    return api.post<AdminLoginResponse>(`${BASE}/login`, body, {
      skipAuthRefresh: true,
    });
  },
  verify2fa(body: AdminVerify2FaRequest) {
    return api.post<AdminLoginResponse>(`${BASE}/verify-2fa`, body, {
      skipAuthRefresh: true,
    });
  },
  me() {
    return api.get<AdminMeResponse>(`${BASE}/me`);
  },
  refresh() {
    return api.post<AdminRefreshResponse>(`${BASE}/refresh`, undefined, {
      skipAuthRefresh: true,
    });
  },
  logout() {
    return api.post<AdminLogoutResponse>(`${BASE}/logout`, undefined, {
      skipAuthRefresh: true,
    });
  },
  setup2fa() {
    return api.post<AdminSetup2FaResponse>(`${BASE}/setup-2fa`);
  },
  confirm2fa(body: AdminSetup2FaRequest) {
    return api.post<{ message: string }>(`${BASE}/confirm-2fa`, body);
  },
};
