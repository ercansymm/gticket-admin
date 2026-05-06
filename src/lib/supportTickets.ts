// Destek Talebi Sistemi — API wrapper
// Merkezi `api` client'ını kullanır (cookie tabanlı auth + 401 refresh)
// NOT: Backend property isimleri (userFullName, bookingPnr, body, ...) burada
// admin DTO'larına (customerFullName, pnr, message, ...) map edilir.

import { api } from "@/lib/api";
import type {
  SupportTicketListItemDto,
  SupportTicketDetailDto,
  SupportTicketMessageDto,
  AdminSupportTicketFilterRequest,
  AddSupportMessageRequest,
  PagedResult,
  SupportTicketType,
  SupportTicketStatus,
  SupportMessageSenderType,
} from "@/types/supportTicket";

// ===== Backend response shape (raw) =====

interface BackendListItem {
  id: string;
  ticketNumber: string;
  type: SupportTicketType;
  subject: string;
  status: SupportTicketStatus;
  bookingId: string | null;
  bookingPnr: string | null;
  userId: string | null;
  guestSessionId: string | null;
  userFullName: string | null;
  userEmail: string | null;
  guestEmail: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderType: SupportMessageSenderType | null;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
}

interface BackendMessage {
  id: string;
  senderType: SupportMessageSenderType;
  senderId: string;
  senderDisplayName: string;
  body: string;
  createdAt: string;
}

interface BackendDetail {
  id: string;
  ticketNumber: string;
  type: SupportTicketType;
  subject: string;
  status: SupportTicketStatus;
  bookingId: string | null;
  bookingPnr: string | null;
  bookingOrigin: string | null;
  bookingDestination: string | null;
  bookingStatus: string | null;
  userId: string | null;
  guestSessionId: string | null;
  userFullName: string | null;
  userEmail: string | null;
  guestEmail: string | null;
  userPhone: string | null;
  closedAt: string | null;
  closedByAdminId: string | null;
  closedByAdminName: string | null;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  messages: BackendMessage[];
}

interface BackendPaged<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ===== Map'ler =====

function mapMessage(m: BackendMessage): SupportTicketMessageDto {
  return {
    id: m.id,
    ticketId: "",
    senderType: m.senderType,
    senderName: m.senderDisplayName ?? "—",
    message: m.body ?? "",
    createdAt: m.createdAt,
  };
}

function mapListItem(t: BackendListItem): SupportTicketListItemDto {
  const isGuest = !t.userId && !!t.guestSessionId;
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    type: t.type,
    subject: t.subject,
    status: t.status,
    customerId: t.userId ?? t.guestSessionId ?? "",
    customerFullName: t.userFullName ?? "—",
    customerEmail: t.userEmail ?? "",
    guestEmail: t.guestEmail ?? null,
    isGuest,
    bookingId: t.bookingId,
    pnr: t.bookingPnr,
    messageCount: t.messageCount,
    lastActivityAt: t.lastActivityAt,
    createdAt: t.createdAt,
  };
}

function mapDetail(t: BackendDetail): SupportTicketDetailDto {
  const route =
    t.bookingOrigin && t.bookingDestination
      ? `${t.bookingOrigin} → ${t.bookingDestination}`
      : null;
  const isGuest = !t.userId && !!t.guestSessionId;
  return {
    id: t.id,
    ticketNumber: t.ticketNumber,
    type: t.type,
    subject: t.subject,
    status: t.status,
    customerId: t.userId ?? t.guestSessionId ?? "",
    customerFullName: t.userFullName ?? "—",
    customerEmail: t.userEmail ?? "",
    guestEmail: t.guestEmail ?? null,
    isGuest,
    customerPhone: t.userPhone,
    bookingId: t.bookingId,
    pnr: t.bookingPnr,
    route,
    createdAt: t.createdAt,
    closedAt: t.closedAt,
    lastActivityAt: t.lastActivityAt,
    messages: (t.messages ?? []).map(mapMessage),
  };
}

/**
 * Destek taleplerini listeler (filtre + sayfalama).
 * GET /api/admin/support-tickets?page=&pageSize=&status=&type=&search=
 */
export async function listSupportTickets(
  filter: AdminSupportTicketFilterRequest
): Promise<PagedResult<SupportTicketListItemDto>> {
  const params = new URLSearchParams();
  params.append("page", filter.page.toString());
  params.append("pageSize", filter.pageSize.toString());
  if (filter.status != null) params.append("status", String(filter.status));
  if (filter.type != null) params.append("type", String(filter.type));
  if (filter.search && filter.search.trim())
    params.append("search", filter.search.trim());

  const raw = await api.get<BackendPaged<BackendListItem>>(
    `/api/admin/support-tickets?${params.toString()}`
  );

  const items = (raw.items ?? []).map(mapListItem);
  const totalCount = raw.totalCount ?? 0;
  const pageSize = raw.pageSize ?? filter.pageSize;
  return {
    items,
    totalCount,
    page: raw.page ?? filter.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

/**
 * Tek bir destek talebinin detayını ve mesaj geçmişini getirir.
 * GET /api/admin/support-tickets/{id}
 */
export async function getSupportTicketById(
  id: string
): Promise<SupportTicketDetailDto> {
  const raw = await api.get<BackendDetail>(`/api/admin/support-tickets/${id}`);
  return mapDetail(raw);
}

/**
 * Destek talebine admin tarafından yanıt ekler.
 * POST /api/admin/support-tickets/{id}/messages
 * Backend yalnızca eklenen mesajı döner; bu yüzden ekledikten sonra detayı tekrar çekiyoruz.
 */
export async function addSupportTicketMessage(
  id: string,
  request: AddSupportMessageRequest
): Promise<SupportTicketDetailDto> {
  await api.post(`/api/admin/support-tickets/${id}/messages`, {
    body: request.message,
  });
  return getSupportTicketById(id);
}

/**
 * Destek talebini kapatır.
 * PATCH /api/admin/support-tickets/{id}/close
 */
export async function closeSupportTicket(
  id: string
): Promise<SupportTicketDetailDto> {
  const raw = await api.patch<BackendDetail>(
    `/api/admin/support-tickets/${id}/close`
  );
  return mapDetail(raw);
}