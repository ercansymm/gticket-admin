"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import BookingDetailModal from "./BookingDetailModal";
import { bookingsApi, type BookingListParams } from "@/lib/bookings";
import type {
  AdminBookingListItem,
  BookingStatusCategory,
  PaginationInfo,
} from "@/types/admin";

/* ── helpers ─────────────────────────────────────────── */

const statusBadgeColor = (
  cat: BookingStatusCategory,
): "success" | "warning" | "error" => {
  switch (cat) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "cancelled":
    case "failed":
      return "error";
  }
};

const statusLabel: Record<BookingStatusCategory, string> = {
  confirmed: "Onaylandı",
  pending: "Bekliyor",
  cancelled: "İptal",
  failed: "Hata",
};

type FilterKey = "all" | BookingStatusCategory;

const STATUS_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "confirmed", label: "Onaylandı" },
  { key: "pending", label: "Bekliyor" },
  { key: "cancelled", label: "İptal" },
  { key: "failed", label: "Hata" },
];

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

const PAGE_SIZE = 10;

/* ── component ───────────────────────────────────────── */

export default function BookingsTable() {
  const [items, setItems] = useState<AdminBookingListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: BookingListParams = {
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await bookingsApi.list(params);
      setItems(res.data);
      setPagination(res.pagination);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Veriler yüklenemedi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Seed handler
  const handleSeed = async () => {
    setSeeding(true);
    try {
      await bookingsApi.seed();
      await fetchBookings();
    } catch {
      // ignore — seed may 200 with "already seeded"
    } finally {
      setSeeding(false);
    }
  };

  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount ?? 0;

  /* ── skeleton rows ── */
  const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, i) => (
    <TableRow key={`sk-${i}`}>
      {Array.from({ length: 7 }, (_, j) => (
        <TableCell key={j} className="px-4 py-3 sm:px-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Filters */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="PNR, yolcu veya güzergah ara..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setStatusFilter(s.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  statusFilter === s.key
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 sm:px-6">
            <span>{error}</span>
            <button
              onClick={fetchBookings}
              className="ml-4 rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 transition"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
              <TableRow>
                {[
                  "PNR",
                  "Yolcu",
                  "Güzergah",
                  "Havayolu",
                  "Tarih",
                  "Tutar",
                  "Durum",
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
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="h-10 w-10 text-gray-300 dark:text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg>
                      <span>Henüz rezervasyon bulunmuyor.</span>
                      <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="mt-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                      >
                        {seeding ? "Oluşturuluyor..." : "Test Verisi Oluştur"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((b) => (
                  <TableRow
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition"
                  >
                    <TableCell className="px-4 py-3 sm:px-6">
                      <span className="font-mono font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {b.pnr ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                      <div>
                        <span>{b.passengerName}</span>
                        {b.passengerCount > 1 && (
                          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
                            +{b.passengerCount - 1}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                      <span className="font-medium">{b.route}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-6">
                      {b.airlineCode ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-6">
                      {formatDate(b.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90 sm:px-6">
                      {formatCurrency(b.amount, b.currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-theme-sm sm:px-6">
                      <Badge
                        size="sm"
                        color={statusBadgeColor(b.statusCategory)}
                      >
                        {statusLabel[b.statusCategory]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Detail modal */}
      {selectedId && (
        <BookingDetailModal
          bookingId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}