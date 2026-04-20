"use client";

import { useEffect, useState, useCallback } from "react";
import type { AdminBookingDetail } from "@/types/admin";
import { bookingsApi } from "@/lib/bookings";
import Badge from "../ui/badge/Badge";

interface Props {
  bookingId: string;
  onClose: () => void;
}

const statusBadgeColor = (
  cat: string,
): "success" | "warning" | "error" | "info" => {
  switch (cat) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "failed":
      return "error";
    default:
      return "info";
  }
};

const statusLabel: Record<string, string> = {
  confirmed: "Onaylandı",
  pending: "Bekliyor",
  cancelled: "İptal",
  failed: "Hata",
};

const paxTypeLabel: Record<string, string> = {
  ADT: "Yetişkin",
  CHD: "Çocuk",
  INF: "Bebek",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function BookingDetailModal({ bookingId, onClose }: Props) {
  const [detail, setDetail] = useState<AdminBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    bookingsApi
      .get(bookingId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Detay yüklenemedi");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Timeline steps
  const timelineSteps = detail
    ? [
        { label: "Oluşturuldu", date: detail.createdAt, done: true },
        {
          label: "Allocate",
          date: detail.allocatedAt,
          done: !!detail.allocatedAt,
        },
        {
          label: "Rezervasyon",
          date: detail.bookedAt,
          done: !!detail.bookedAt,
        },
        { label: "Ödeme", date: detail.paidAt, done: !!detail.paidAt },
        {
          label: "Biletlendi",
          date: detail.ticketedAt,
          done: !!detail.ticketedAt,
        },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-999999 flex items-start justify-center bg-black/50 pt-10 pb-10 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl mx-4 rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rezervasyon Detayı
            </h2>
            {detail && (
              <Badge
                size="sm"
                color={statusBadgeColor(detail.statusCategory)}
              >
                {statusLabel[detail.statusCategory] ?? detail.status}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {detail && !loading && (
            <div className="space-y-6">
              {/* PNR & General Info */}
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="PNR" value={detail.pnr ?? "—"} mono />
                <InfoItem
                  label="İç PNR"
                  value={detail.internalPnr ?? "—"}
                  mono
                />
                <InfoItem label="Güzergah" value={detail.route} />
                <InfoItem
                  label="Uçuş"
                  value={
                    detail.flightNumber
                      ? `${detail.airlineCode ?? ""} ${detail.flightNumber}`
                      : "—"
                  }
                />
                <InfoItem
                  label="Tutar"
                  value={formatCurrency(detail.amount, detail.currency)}
                />
                <InfoItem
                  label="Hizmet Bedeli"
                  value={formatCurrency(detail.serviceFee, detail.currency)}
                />
                <InfoItem
                  label="Komisyon"
                  value={formatCurrency(
                    detail.ourCommission,
                    detail.currency,
                  )}
                />
                <InfoItem
                  label="Yolcu"
                  value={`${detail.adultCount} Yetişkin${detail.childCount > 0 ? `, ${detail.childCount} Çocuk` : ""}${detail.infantCount > 0 ? `, ${detail.infantCount} Bebek` : ""}`}
                />
              </div>

              {/* Timeline */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Süreç
                </h3>
                <div className="flex items-center gap-1">
                  {timelineSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            step.done
                              ? "bg-emerald-500"
                              : "border-2 border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <span className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {step.label}
                        </span>
                        {step.done && (
                          <span className="text-[9px] text-gray-400">
                            {formatDate(step.date)}
                          </span>
                        )}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div
                          className={`h-0.5 w-8 sm:w-12 ${
                            step.done && timelineSteps[i + 1].done
                              ? "bg-emerald-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancelled notice */}
              {detail.cancelledAt && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  İptal tarihi: {formatDate(detail.cancelledAt)}
                </div>
              )}

              {/* Last error */}
              {detail.lastError && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Son hata: {detail.lastError}
                </div>
              )}

              {/* Passengers */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Yolcular ({detail.passengers.length})
                </h3>
                <div className="space-y-2">
                  {detail.passengers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5 dark:border-gray-800"
                    >
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white/90 text-sm">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {paxTypeLabel[p.passengerType] ?? p.passengerType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {p.gender && (
                          <span>{p.gender === "M" ? "Erkek" : "Kadın"}</span>
                        )}
                        {p.birthDate && <span>{p.birthDate}</span>}
                        {p.email && <span>{p.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs (collapsible) */}
              {detail.logs.length > 0 && (
                <div>
                  <button
                    onClick={() => setLogsOpen(!logsOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-600 transition"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${logsOpen ? "rotate-90" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                    İşlem Logları ({detail.logs.length})
                  </button>

                  {logsOpen && (
                    <div className="mt-2 overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                              İşlem
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                              Durum
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                              Tarih
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">
                              Süre
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {detail.logs.map((log, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                {log.operation}
                              </td>
                              <td className="px-3 py-2">
                                {log.isSuccess ? (
                                  <span className="text-emerald-600">
                                    Başarılı
                                  </span>
                                ) : (
                                  <span className="text-red-500">
                                    Hata
                                    {log.errorMessage
                                      ? `: ${log.errorMessage}`
                                      : ""}
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                {formatDate(log.createdAt)}
                              </td>
                              <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                                {log.responseTimeMs
                                  ? `${log.responseTimeMs}ms`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd
        className={`mt-0.5 text-sm font-medium text-gray-800 dark:text-white/90 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
