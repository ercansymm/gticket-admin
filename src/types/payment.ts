/**
 * ATABİLET Admin Panel — Payment Types
 * Backend: GBILET.Core/DTOs/Admin/AdminPaymentDtos.cs karşılığı
 */
import type { PaginationInfo } from "./admin";

export type PaymentStatusCategory = "success" | "pending" | "failed" | "stuck";

export type PaymentErrorCode =
  | "CardLimit"
  | "ThreeDFailed"
  | "BankRejected"
  | "Timeout"
  | "InvalidCard"
  | "Other";

export interface AdminPaymentListItem {
  id: string;
  bookingId: string;

  pnr: string | null;
  internalPnr: string | null;
  route: string;

  customerName: string;

  amount: number;
  currency: string;
  paymentType: string | null; // RunningAccount | CreditCard | CreditCardDirect
  maskedCardNumber: string | null;
  installmentCount: number;

  status: string; // Success / Failed / Pending3D / Pending
  statusCategory: PaymentStatusCategory;

  is3DSecure: boolean;
  errorCode: string | null;
  errorMessage: string | null;

  transactionDate: string; // ISO
}

export interface AdminPaymentListResponse {
  data: AdminPaymentListItem[];
  pagination: PaginationInfo;
}

export interface AdminPaymentDetail {
  id: string;
  bookingId: string;

  pnr: string | null;
  internalPnr: string | null;
  route: string;
  airlineCode: string | null;
  flightNumber: string | null;
  bookingStatus: string;
  bookingStatusCategory: string;

  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;

  amount: number;
  currency: string;
  paymentType: string | null;
  maskedCardNumber: string | null;
  cardHolder: string | null;
  installmentCount: number;
  is3DSecure: boolean;

  status: string;
  statusCategory: PaymentStatusCategory;

  errorCode: string | null;
  errorCodeLabel: string | null;
  errorMessage: string | null;

  biletBankPaymentId: string | null;
  providerTransactionId: string | null;

  transactionDate: string;
  refundedAt: string | null;
  refundAmount: number | null;
}

export interface AdminFailed3DGroup {
  errorCode: string;
  label: string;
  count: number;
}

export interface AdminFailed3DResponse {
  groups: AdminFailed3DGroup[];
  data: AdminPaymentListItem[];
  pagination: PaginationInfo;
}
