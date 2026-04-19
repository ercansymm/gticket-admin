import { api } from "./api";
import type {
  DashboardRecentBooking,
  DashboardRevenuePoint,
  DashboardStats,
} from "@/types/admin";

const BASE = "/api/admin/dashboard";

export const dashboardApi = {
  stats() {
    return api.get<DashboardStats>(`${BASE}/stats`);
  },
  revenue(months: number = 6) {
    return api.get<DashboardRevenuePoint[]>(`${BASE}/revenue?months=${months}`);
  },
  recentBookings(limit: number = 10) {
    return api.get<DashboardRecentBooking[]>(
      `${BASE}/recent-bookings?limit=${limit}`,
    );
  },
};
