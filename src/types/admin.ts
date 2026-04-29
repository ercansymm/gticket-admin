/**
 * ATABİLET Admin Panel — Type Definitions
 * Backend: GBILET.Core/DTOs/Admin/AdminAuthDtos.cs karşılığı
 */

// ===== User =====

export type AdminRole = "SuperAdmin" | "DepartmentAdmin" | string;

export interface AdminUser {
  id: string; // Guid
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null; // ISO datetime
}

/** /me endpoint'inin döndüğü daha dar tipli user */
export interface AdminMeResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
}

// ===== Auth Requests =====

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminVerify2FaRequest {
  twoFactorToken: string;
  code: string;
}

export interface AdminSetup2FaRequest {
  code: string;
}

// ===== Auth Responses =====

export interface AdminLoginResponse {
  requiresTwoFactor: boolean;
  /** 5dk geçerli, sadece 2FA verify için. 2FA gerekmiyorsa null. */
  twoFactorToken: string | null;
  /** 2FA gerekmiyorsa dolu gelir. Gerekliyse null. */
  user: AdminUser | null;
  /** Access token süresi. 2FA gerekliyse null. */
  accessTokenExpiresAt: string | null;
}

export interface AdminRefreshResponse {
  accessTokenExpiresAt: string;
}

export interface AdminSetup2FaResponse {
  secret: string;
  qrCodeBase64: string;
}

export interface AdminLogoutResponse {
  message: string;
}

// ===== Dashboard =====

export interface DashboardStats {
  totalBookings: number;
  totalBookingsThisMonth: number;
  totalRevenue: number;
  totalRevenueThisMonth: number;
  totalCustomers: number;
  totalCustomersThisMonth: number;
  activeUsers: number;
  bookingsChangePercent: number;
  revenueChangePercent: number;
  customersChangePercent: number;
  activeUsersChangePercent: number;
}

export interface DashboardRevenuePoint {
  month: string; // "YYYY-MM"
  revenue: number;
  bookings: number;
}

export interface DashboardRecentBooking {
  id: string;
  pnrCode: string | null;
  passengerName: string;
  route: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string; // ISO
}

// ===== Bookings =====

export type BookingStatusCategory = "confirmed" | "pending" | "cancelled" | "failed";

export interface AdminBookingListItem {
  id: string;
  pnr: string | null;
  internalPnr: string | null;
  passengerName: string;
  passengerCount: number;
  route: string;
  airlineCode: string | null;
  flightNumber: string | null;
  amount: number;
  currency: string;
  status: string;
  statusCategory: BookingStatusCategory;
  isFinalized: boolean;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminBookingListResponse {
  data: AdminBookingListItem[];
  pagination: PaginationInfo;
}

export interface AdminPassenger {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  passengerType: string;
  birthDate: string | null;
  gender: string | null;
}

export interface AdminBookingLog {
  operation: string;
  isSuccess: boolean;
  errorMessage: string | null;
  createdAt: string;
  responseTimeMs: number | null;
  httpStatusCode: number | null;
}

export interface AdminBookingDetail {
  id: string;
  pnr: string | null;
  internalPnr: string | null;
  status: string;
  statusCategory: BookingStatusCategory;
  isFinalized: boolean;
  amount: number;
  currency: string;
  serviceFee: number;
  ourCommission: number;
  route: string;
  airlineCode: string | null;
  flightNumber: string | null;
  adultCount: number;
  childCount: number;
  infantCount: number;
  createdAt: string;
  updatedAt: string | null;
  allocatedAt: string | null;
  bookedAt: string | null;
  paidAt: string | null;
  ticketedAt: string | null;
  cancelledAt: string | null;
  lastError: string | null;
  passengers: AdminPassenger[];
  logs: AdminBookingLog[];
}

// ===== Customers =====

export interface CustomerListItem {
  fullName: string;
  email: string;
  phone: string | null;
  bookingCount: number;
}

export interface CustomerListResponse {
  items: CustomerListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}