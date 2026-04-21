"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import PaymentDetailModal from "./PaymentDetailModal";
import { paymentsApi } from "@/lib/payments";
import type {
  AdminPaymentListItem,
  AdminFailed3DGroup,
} from "@/types/payment";
import type { PaginationInfo } from "@/types/admin";

const PAGE_SIZE = 10;

const ERROR_CODE_ORDER = [
  "CardLimit",
  "ThreeDFailed",
  "BankRejected",
  "InvalidCard",
  "Timeout",
  "Other",
];

const errorIcon: Record<string, ReactElement> = {
  CardLimit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M7 15h2" />
    </svg>
  ),
  ThreeDFailed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  BankRejected: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />
    </svg>
  ),
  Timeout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  InvalidCard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="m4 7 16 10" />
    </svg>
  ),
  Other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
};

function formatDate(iso: string): string {
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

export default function Failed3DTable() {
  const [groups, setGroups] = useState<AdminFailed3DGroup[]>([]);
  const [items, setItems] = useState<AdminPaymentListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentsApi.failed3D({
        page,
        pageSize: PAGE_SIZE,
        errorCode: errorCode ?? undefined,
      });
      setGroups(res.groups);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Veriler yüklenemedi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, errorCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount ?? 0;

  const sortedGroups = [...groups].sort(
    (a, b) =>
      ERROR_CODE_ORDER.indexOf(a.errorCode) -
      ERROR_CODE_ORDER.indexOf(b.errorCode),
  );

  const totalAcrossGroups = groups.reduce((sum, g) => sum + g.count, 0);

  const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, i) => (
    <TableRow key={`sk-${i}`}>
      {Array.from({ length: 6 }, (_, j) => (
        <TableCell key={j} className="px-4 py-3 sm:px-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <>
      {/* Hata kategorisi kartları */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          onClick={() => {
            setErrorCode(null);
            setPage(1);
          }}
          className={`rounded-xl border p-4 text-left transition ${
            errorCode === null
              ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20"
              : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
          }`}
        >
          <div className="text-xs text-gray-500 dark:text-gray-400">Tümü</div>
          <div className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {totalAcrossGroups}
          </div>
        </button>

        {sortedGroups.map((g) => {
          const active = errorCode === g.errorCode;
          return (
            <button
              key={g.errorCode}
              onClick={() => {
                setErrorCode(g.errorCode);
                setPage(1);
              }}
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-900/20"
                  : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                {errorIcon[g.errorCode] ?? errorIcon.Other}
                <div className="text-xs font-medium uppercase tracking-wide">
                  {g.label}
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
                {g.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-6">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {errorCode
              ? `${sortedGroups.find((g) => g.errorCode === errorCode)?.label ?? errorCode} kayıtları`
              : "Tüm 3D Başarısız Kayıtlar"}
          </h2>
          {errorCode && (
            <button
              onClick={() => {
                setErrorCode(null);
                setPage(1);
              }}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              Filtreyi temizle
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center justify-between bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 sm:px-6">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="ml-4 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 transition"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
              <TableRow>
                {[
                  "ATA PNR",
                  "Müşteri",
                  "Tutar",
                  "Hata",
                  "Kart",
                  "Tarih",
                ].map((h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-6"
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                skeletonRows
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell className="px-4 py-10 text-center text-gray-500 text-theme-sm sm:px-6">
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="h-10 w-10 text-gray-300 dark:text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Bu kategoride başarısız ödeme bulunmuyor.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((p) => {
                  const code = p.errorCode ?? "Other";
                  const label =
                    sortedGroups.find((g) => g.errorCode === code)?.label ??
                    code;
                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition"
                    >
                      <TableCell className="px-4 py-3 sm:px-6">
                        <span className="font-mono font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                          {p.internalPnr ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                        <div>{p.customerName}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {p.route}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90 sm:px-6">
                        {formatCurrency(p.amount, p.currency)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-theme-sm sm:px-6">
                        <Badge size="sm" color="error">
                          {label}
                        </Badge>
                        {p.errorMessage && (
                          <div
                            className="mt-1 max-w-xs truncate text-xs text-gray-400 dark:text-gray-500"
                            title={p.errorMessage}
                          >
                            {p.errorMessage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 sm:px-6">
                        {p.maskedCardNumber ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-6">
                        {formatDate(p.transactionDate)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Toplam{" "}
            <span className="font-semibold text-gray-800 dark:text-white/90">
              {totalCount}
            </span>{" "}
            kayıt
            {totalCount > 0 && (
              <>
                {" "}
                — Sayfa{" "}
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {page}
                </span>
                /{totalPages}
              </>
            )}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>

      {selectedId && (
        <PaymentDetailModal
          paymentId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
