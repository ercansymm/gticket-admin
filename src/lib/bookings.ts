import { api } from "./api";
import type {
  AdminBookingListResponse,
  AdminBookingDetail,
  BookingStatusCategory,
} from "@/types/admin";

export interface BookingListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: BookingStatusCategory | "all";
  sortBy?: "createdAt" | "amount" | "pnr";
  sortDir?: "asc" | "desc";
}

function buildQuery(params: BookingListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.search) qs.set("search", params.search);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.sortDir) qs.set("sortDir", params.sortDir);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const bookingsApi = {
  list(params: BookingListParams = {}) {
    return api.get<AdminBookingListResponse>(
      `/api/admin/bookings${buildQuery(params)}`,
    );
  },

  get(id: string) {
    return api.get<AdminBookingDetail>(`/api/admin/bookings/${id}`);
  },

  seed() {
    return api.post<{ message: string; count: number }>(
      "/api/admin/seed/bookings",
    );
  },
};
