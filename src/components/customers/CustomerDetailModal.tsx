"use client";

import { useEffect, useCallback } from "react";
import type { CustomerListItem } from "@/types/admin";

interface Props {
  customer: CustomerListItem;
  tab: "registered" | "guest";
  onClose: () => void;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CustomerDetailModal({ customer, tab, onClose }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-999999 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10"
      onClick={handleBackdropClick}
    >
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm dark:bg-emerald-500/20 dark:text-emerald-300">
              {initials(customer.fullName)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {customer.fullName}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tab === "registered" ? "Kayıtlı Müşteri" : "Misafir Müşteri"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
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
        <div className="px-6 py-5 space-y-6">
          {/* İletişim Bilgileri */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem label="Ad Soyad" value={customer.fullName} />
              <InfoItem label="Email" value={customer.email} />
              <InfoItem label="Telefon" value={customer.phone ?? "—"} mono />
            </div>
          </div>

          {/* Aktivite */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Aktivite
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rezervasyon Sayısı</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.bookingCount}
                </p>
              </div>
              {tab === "registered" && customer.createdAt && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kayıt Tarihi</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(customer.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
          >
            Kapat
          </button>
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
        className={`mt-0.5 text-sm font-medium text-gray-800 dark:text-white/90 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
