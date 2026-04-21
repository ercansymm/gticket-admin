import { api } from "./api";
import type {
  AdminPaymentListResponse,
  AdminPaymentDetail,
  AdminFailed3DResponse,
  PaymentStatusCategory,
} from "@/types/payment";

export interface PaymentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PaymentStatusCategory | "all";
  paymentType?: string;
}

export interface Failed3DParams {
  page?: number;
  pageSize?: number;
  errorCode?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "" || v === "all") continue;
    qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const paymentsApi = {
  list(params: PaymentListParams = {}) {
    return api.get<AdminPaymentListResponse>(
      `/api/admin/payments${buildQuery({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        status: params.status,
        paymentType: params.paymentType,
      })}`,
    );
  },

  get(id: string) {
    return api.get<AdminPaymentDetail>(`/api/admin/payments/${id}`);
  },

  failed3D(params: Failed3DParams = {}) {
    return api.get<AdminFailed3DResponse>(
      `/api/admin/payments/failed-3d${buildQuery({
        page: params.page,
        pageSize: params.pageSize,
        errorCode: params.errorCode,
      })}`,
    );
  },

  retryFinalize(id: string) {
    return api.post<{
      ticketed: boolean;
      pnr: string | null;
      status: string;
      ticketCount: number;
    }>(`/api/admin/payments/${id}/retry-finalize`, {});
  },
};
