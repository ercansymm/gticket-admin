// Destek Talebi Sistemi — tip tanımları
// Backend: GBILET.Core/DTOs/Support/SupportTicketDtos.cs
// NOT: Backend JSON serializer'ı JsonStringEnumConverter kullanıyor,
// bu yüzden enum'lar string olarak gelir ("Open", "Refund", "Customer", ...).

// ===== Enum'lar =====

export enum SupportTicketType {
  Refund = "Refund",
  Change = "Change",
  Complaint = "Complaint",
  Technical = "Technical",
}

export enum SupportTicketStatus {
  Open = "Open",
  Closed = "Closed",
}

export enum SupportMessageSenderType {
  Customer = "Customer",
  Admin = "Admin",
}

// ===== Label map'ler =====

export const SupportTicketTypeLabels: Record<SupportTicketType, string> = {
  [SupportTicketType.Refund]: "İade",
  [SupportTicketType.Change]: "Değişiklik",
  [SupportTicketType.Complaint]: "Şikayet",
  [SupportTicketType.Technical]: "Teknik",
};

export const SupportTicketStatusLabels: Record<SupportTicketStatus, string> = {
  [SupportTicketStatus.Open]: "Açık",
  [SupportTicketStatus.Closed]: "Kapalı",
};

export const SupportMessageSenderTypeLabels: Record<SupportMessageSenderType, string> = {
  [SupportMessageSenderType.Customer]: "Müşteri",
  [SupportMessageSenderType.Admin]: "Admin",
};

// Badge renkleri (AdminUsersTable pattern'ına uygun)
export type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

export const SupportTicketTypeBadgeColor: Record<SupportTicketType, BadgeColor> = {
  [SupportTicketType.Refund]: "error",
  [SupportTicketType.Change]: "info",
  [SupportTicketType.Complaint]: "warning",
  [SupportTicketType.Technical]: "primary",
};

export const SupportTicketStatusBadgeColor: Record<SupportTicketStatus, BadgeColor> = {
  [SupportTicketStatus.Open]: "warning",
  [SupportTicketStatus.Closed]: "light",
};

// ===== DTO'lar (backend ile birebir) =====

export interface SupportTicketListItemDto {
  id: string;
  ticketNumber: string;
  type: SupportTicketType;
  subject: string;
  status: SupportTicketStatus;
  customerId: string;
  customerFullName: string;
  customerEmail: string;
  guestEmail: string | null;
  isGuest: boolean;
  bookingId: string | null;
  pnr: string | null;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface SupportTicketMessageDto {
  id: string;
  ticketId: string;
  senderType: SupportMessageSenderType;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicketDetailDto {
  id: string;
  ticketNumber: string;
  type: SupportTicketType;
  subject: string;
  status: SupportTicketStatus;
  customerId: string;
  customerFullName: string;
  customerEmail: string;
  guestEmail: string | null;
  isGuest: boolean;
  customerPhone: string | null;
  bookingId: string | null;
  pnr: string | null;
  route: string | null;
  createdAt: string;
  closedAt: string | null;
  lastActivityAt: string;
  messages: SupportTicketMessageDto[];
}

// ===== Request'ler =====

export interface AdminSupportTicketFilterRequest {
  page: number;
  pageSize: number;
  status?: SupportTicketStatus | null;
  type?: SupportTicketType | null;
  search?: string | null;
}

export interface AddSupportMessageRequest {
  message: string;
}

// ===== Pagination =====

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}