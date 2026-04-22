import { api } from "./api";

import type {
  DashboardRecentBooking,
  DashboardRevenuePoint,
  DashboardStats,
} from "@/types/admin";
import type { DashboardRecentSupportTicketResponse } from "@/types/support-tickets";

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
  recentSupportTickets(limit: number = 10) {
    // Sayfalama için page=1, pageSize=limit
    return api.get<DashboardRecentSupportTicketResponse>(
      `/api/admin/support-tickets?page=1&pageSize=${limit}`
    );
  },
};
