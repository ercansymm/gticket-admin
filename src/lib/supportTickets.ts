// Destek Talebi Sistemi — API wrapper
// Merkezi `api` client'ını kullanır (cookie tabanlı auth + 401 refresh)

import { api } from "@/lib/api";
import type {
  SupportTicketListItemDto,
  SupportTicketDetailDto,
  AdminSupportTicketFilterRequest,
  AddSupportMessageRequest,
  PagedResult,
} from "@/types/supportTicket";

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
  if (filter.status != null) params.append("status", filter.status.toString());
  if (filter.type != null) params.append("type", filter.type.toString());
  if (filter.search && filter.search.trim())
    params.append("search", filter.search.trim());

  return api.get<PagedResult<SupportTicketListItemDto>>(
    `/api/admin/support-tickets?${params.toString()}`
  );
}

/**
 * Tek bir destek talebinin detayını ve mesaj geçmişini getirir.
 * GET /api/admin/support-tickets/{id}
 */
export async function getSupportTicketById(
  id: string
): Promise<SupportTicketDetailDto> {
  return api.get<SupportTicketDetailDto>(`/api/admin/support-tickets/${id}`);
}

/**
 * Destek talebine admin tarafından yanıt ekler.
 * POST /api/admin/support-tickets/{id}/messages
 */
export async function addSupportTicketMessage(
  id: string,
  request: AddSupportMessageRequest
): Promise<SupportTicketDetailDto> {
  return api.post<SupportTicketDetailDto>(
    `/api/admin/support-tickets/${id}/messages`,
    request
  );
}

/**
 * Destek talebini kapatır.
 * PATCH /api/admin/support-tickets/{id}/close
 */
export async function closeSupportTicket(
  id: string
): Promise<SupportTicketDetailDto> {
  return api.patch<SupportTicketDetailDto>(
    `/api/admin/support-tickets/${id}/close`
  );
}