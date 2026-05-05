import { api } from "./api";
import type { CustomerListResponse } from "@/types/admin";

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

function buildQuery(params: CustomerListParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.search) qs.set("search", params.search);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const customersApi = {
  passengers(params: CustomerListParams = {}) {
    return api.get<CustomerListResponse>(
      `/api/admin/customers/passengers${buildQuery(params)}`,
    );
  },

  bookingContacts(params: CustomerListParams = {}) {
    return api.get<CustomerListResponse>(
      `/api/admin/customers/booking-contacts${buildQuery(params)}`,
    );
  },

  registeredUsers(params: CustomerListParams = {}) {
    return api.get<CustomerListResponse>(
      `/api/admin/customers/registered-users${buildQuery(params)}`,
    );
  },
};
