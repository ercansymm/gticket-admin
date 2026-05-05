"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { customersApi, type CustomerListParams } from "@/lib/customers";
import type { CustomerListItem } from "@/types/admin";
import CustomerDetailModal from "./CustomerDetailModal";

type TabKey = "registered" | "guest";

const TABS: { key: TabKey; label: string }[] = [
  { key: "registered", label: "Kayıtlı Müşteriler" },
  { key: "guest", label: "Misafir Müşteriler" },
];

const PAGE_SIZE = 20;

const TR_MAP: Record<string, string> = {
  "ç": "C", "Ç": "C",
  "ğ": "G", "Ğ": "G",
  "ı": "I", "İ": "I",
  "ö": "O", "Ö": "O",
  "ş": "S", "Ş": "S",
  "ü": "U", "Ü": "U",
};

function normalizeTurkish(text: string): string {
  return text
    .split("")
    .map((ch) => TR_MAP[ch] || ch)
    .join("")
    .toUpperCase();
}

export default function CustomersTable() {
  const [tab, setTab] = useState<TabKey>("guest");
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerListItem | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CustomerListParams = {
        page,
        pageSize: PAGE_SIZE,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = tab === "registered"
        ? await customersApi.registeredUsers(params)
        : await customersApi.bookingContacts(params);

      setItems(res.items);
      setTotalCount(res.totalCount);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Veriler yüklenemedi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (newTab: TabKey) => {
    setTab(newTab);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const skeletonRows = Array.from({ length: 5 }, (_, i) => (
    <TableRow key={`sk-${i}`}>
      {Array.from({ length: 4 }, (_, j) => (
        <TableCell key={j} className="px-4 py-3 sm:px-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <>
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-100 dark:border-gray-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
              tab === t.key
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(normalizeTurkish(e.target.value))}
            placeholder="Ad, email veya telefon ile ara..."
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
      </div>

      {/* Error */}
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

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
            <TableRow>
              {["Ad Soyad", "Email", "Telefon", "Rezervasyon Sayısı"].map(
                (h) => (
                  <TableCell
                    key={h}
                    isHeader
                    className={`px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-6 ${
                      h === "Rezervasyon Sayısı" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              skeletonRows
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-10 text-center text-gray-500 text-theme-sm sm:px-6">
                  Kayıt bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              items.map((c, idx) => (
                <TableRow
                  key={`${c.email}-${idx}`}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
                  onClick={() => setSelectedCustomer(c)}
                >
                  <TableCell className="px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm dark:bg-emerald-500/20 dark:text-emerald-300">
                        {initials(c.fullName)}
                      </div>
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {c.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                    {c.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm sm:px-6">
                    {c.phone ? (
                      <span className="font-mono text-gray-700 dark:text-gray-300">
                        {c.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right sm:px-6">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-theme-sm font-semibold dark:bg-gray-800 dark:text-gray-300">
                      {c.bookingCount}
                    </span>
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

    {selectedCustomer && (
      <CustomerDetailModal
        customer={selectedCustomer}
        tab={tab}
        onClose={() => setSelectedCustomer(null)}
      />
    )}
    </>
  );
}