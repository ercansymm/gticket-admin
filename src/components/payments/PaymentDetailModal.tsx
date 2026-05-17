"use client";

import { useEffect, useState, useCallback } from "react";
import type { AdminPaymentDetail, PaymentStatusCategory } from "@/types/payment";
import { paymentsApi } from "@/lib/payments";
import Badge from "../ui/badge/Badge";

interface Props {
  paymentId: string;
  onClose: () => void;
}

const statusBadgeColor = (
  cat: PaymentStatusCategory,
): "success" | "warning" | "error" => {
  switch (cat) {
    case "success":
      return "success";
    case "pending":
      return "warning";
    case "failed":
    case "stuck":
      return "error";
  }
};

const statusLabel: Record<PaymentStatusCategory, string> = {
  success: "Başarılı",
  pending: "Beklemede",
  failed: "Başarısız",
  stuck: "Tahsil edildi, biletlenmedi",
};

const paymentTypeLabel: Record<string, string> = {
  RunningAccount: "Cari Hesap",
  CreditCard: "Kredi Kartı (3D Secure)",
  CreditCardDirect: "Kredi Kartı (Direkt)",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  // DB timestamps have no timezone suffix; treat them as UTC
  const normalized =
    iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  return new Date(normalized).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(raw: string | null): string {
  if (!raw) return "—";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) {
    const num = digits.slice(2);
    return `+90-${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6, 8)}-${num.slice(8, 10)}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    const num = digits.slice(1);
    return `+90-${num.slice(0, 3)}-${num.slice(3, 6)}-${num.slice(6, 8)}-${num.slice(8, 10)}`;
  }
  return raw;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PaymentDetailModal({ paymentId, onClose }: Props) {
  const [detail, setDetail] = useState<AdminPaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    paymentsApi
      .get(paymentId)
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
  }, [paymentId]);

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

  const handleRetryFinalize = async () => {
    if (!detail || retrying) return;
    if (
      !confirm(
        "BiletBank üzerinde bu rezervasyon için FinalizeShopping (biletleme) tekrar denenecek. Devam edilsin mi?",
      )
    )
      return;
    setRetrying(true);
    setRetryResult(null);
    try {
      const res = await paymentsApi.retryFinalize(detail.id);
      if (res.ticketed) {
        setRetryResult({
          ok: true,
          message: `Biletleme başarılı. PNR: ${res.pnr ?? "-"} — ${res.ticketCount} bilet`,
        });
        // Detayı tazele
        const fresh = await paymentsApi.get(detail.id);
        setDetail(fresh);
      } else {
        setRetryResult({ ok: false, message: "Biletleme başarısız." });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Biletleme tekrar denenirken hata oluştu.";
      setRetryResult({ ok: false, message: msg });
    } finally {
      setRetrying(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

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
              Ödeme Detayı
            </h2>
            {detail && (
              <Badge size="sm" color={statusBadgeColor(detail.statusCategory)}>
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
              {/* Tutar — büyük göster */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 px-5 py-4 dark:border-emerald-900/40 dark:from-emerald-900/10 dark:to-teal-900/10">
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  Toplam Tutar
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(detail.amount, detail.currency)}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {detail.paymentType
                    ? (paymentTypeLabel[detail.paymentType] ??
                      detail.paymentType)
                    : "—"}
                  {detail.installmentCount > 1 && (
                    <span className="ml-2">
                      · {detail.installmentCount} taksit
                    </span>
                  )}
                </div>
              </div>

              {/* Booking referans */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Rezervasyon
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="ATA PNR" value={detail.internalPnr ?? "—"} mono />
                  <InfoItem label="Havayolu PNR" value={detail.pnr ?? "—"} mono />
                  <InfoItem label="Güzergah" value={detail.route} />
                  <InfoItem
                    label="Uçuş"
                    value={
                      detail.flightNumber
                        ? `${detail.airlineCode ?? ""} ${detail.flightNumber}`
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* Müşteri */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Müşteri
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Ad Soyad" value={detail.customerName} />
                  <InfoItem label="E-posta" value={detail.customerEmail ?? "—"} />
                  <InfoItem label="Telefon" value={formatPhone(detail.customerPhone)} />
                </div>
              </div>

              {/* Kart bilgisi */}
              {(detail.maskedCardNumber || detail.cardHolder) && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Kart Bilgisi
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Kart No"
                      value={detail.maskedCardNumber ?? "—"}
                      mono
                    />
                    <InfoItem
                      label="Kart Sahibi"
                      value={detail.cardHolder ?? "—"}
                    />
                  </div>
                </div>
              )}

              {/* Hata kutusu */}
              {(detail.errorCode || detail.errorMessage) && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-red-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                    <div className="flex-1 text-sm">
                      <div className="font-semibold text-red-700 dark:text-red-300">
                        {detail.errorCodeLabel ?? "Ödeme hatası"}
                      </div>
                      {detail.errorMessage && (
                        <div className="mt-1 text-red-600 dark:text-red-400">
                          {detail.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Stuck (CapturedNotTicketed) — manuel biletleme aksiyonu */}
              {detail.statusCategory === "stuck" && (
                <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                        Tahsilat alındı, bilet basılamadı
                      </div>
                      <div className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                        Otomatik biletleme denemeleri başarısız oldu. Aşağıdaki
                        butonla BiletBank üzerinde FinalizeShopping&apos;i tekrar
                        deneyebilirsiniz. Başarısız olursa BiletBank operasyon
                        ekibiyle iletişime geçin.
                      </div>
                      <button
                        onClick={handleRetryFinalize}
                        disabled={retrying}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
                      >
                        {retrying && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {retrying ? "Deneniyor..." : "Manuel Biletlemeyi Dene"}
                      </button>
                      {retryResult && (
                        <div
                          className={`mt-3 rounded-md px-3 py-2 text-xs ${
                            retryResult.ok
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {retryResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sağlayıcı */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Sağlayıcı
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    label="BiletBank Payment ID"
                    value={detail.biletBankPaymentId ?? "—"}
                    mono
                  />
                  <InfoItem
                    label="İşlem Tarihi"
                    value={formatDate(detail.transactionDate)}
                  />
                  <InfoItem
                    label="3D Secure"
                    value={detail.is3DSecure ? "Evet" : "Hayır"}
                  />
                </div>
              </div>

              {/* İade */}
              {detail.refundedAt && (
                <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <div className="font-semibold">İade Edildi</div>
                  <div className="mt-1 text-xs">
                    {formatDate(detail.refundedAt)}
                    {detail.refundAmount != null && (
                      <span className="ml-2">
                        — {formatCurrency(detail.refundAmount, detail.currency)}
                      </span>
                    )}
                  </div>
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
        className={`mt-0.5 text-sm font-medium text-gray-800 dark:text-white/90 break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
