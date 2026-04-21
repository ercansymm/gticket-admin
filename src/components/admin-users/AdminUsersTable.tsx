"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { adminUsersApi } from "@/lib/adminUsers";
import type { AdminUserListItem, AdminRole } from "@/types/adminUser";
import { ROLE_LABELS } from "@/types/adminUser";
import AdminUserDetailModal from "./AdminUserDetailModal";
import CreateAdminUserModal from "./CreateAdminUserModal";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Pasif" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getRoleBadgeColor(role: AdminRole): "error" | "info" | "light" {
  switch (role) {
    case "SuperAdmin":
      return "error";
    case "CallCenter":
      return "info";
    case "ReadOnly":
      return "light";
    default:
      return "light";
  }
}

export default function AdminUsersTable() {
  const [items, setItems] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusTab, setStatusTab] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch data — client-side filtering (liste küçük olacak, ~5-20 kullanıcı)

const fetchData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await adminUsersApi.list();
    console.log("🔍 API'den gelen data:", data); // ← EKLE
    console.log("🔍 Array mi?", Array.isArray(data), "uzunluk:", data?.length); // ← EKLE
    setItems(data);
  } catch (e: unknown) {
    setError(e instanceof Error ? e.message : "Admin kullanıcıları yüklenemedi");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filter
  const filteredItems = useMemo(() => {
    let result = items;

    if (statusTab === "active") result = result.filter((u) => u.isActive);
    if (statusTab === "inactive") result = result.filter((u) => !u.isActive);

    if (debouncedSearch) {
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(debouncedSearch) ||
          u.email.toLowerCase().includes(debouncedSearch) ||
          u.fullName.toLowerCase().includes(debouncedSearch)
      );
    }

    return result;
  }, [items, statusTab, debouncedSearch]);

  console.log("🔎 Filter debug:", {
  itemsLength: items.length,
  statusTab,
  debouncedSearch,
  filteredLength: filteredItems.length,
  page,
});

  const totalCount = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pagedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleTabChange = (tab: StatusFilter) => {
    setStatusTab(tab);
    setPage(1);
  };

  const handleUserUpdated = () => {
    fetchData();
  };

  const handleUserCreated = () => {
    setCreateOpen(false);
    fetchData();
  };

  const skeletonRows = Array.from({ length: 5 }, (_, i) => (
    <TableRow key={`sk-${i}`}>
      {Array.from({ length: 6 }, (_, j) => (
        <TableCell key={j} className="px-5 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header: tabs + search + create button */}
        <div className="flex flex-col gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  statusTab === tab.key
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:bg-white/[0.08]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Create */}
          <div className="flex gap-3">
            <input
              type="search"
              placeholder="Kullanıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-gray-500 lg:w-64"
            />
            <button
              onClick={() => setCreateOpen(true)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Yeni kullanıcı
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 sm:px-6">
            <span>{error}</span>
            <button
              onClick={fetchData}
              className="font-medium underline hover:no-underline"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Kullanıcı Adı
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Ad Soyad
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Email
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Rol
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Durum
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Son Giriş
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                skeletonRows
           ) : (

                pagedItems.map((u) => (
                  <TableRow
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {u.username}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {u.fullName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {u.email}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge color={getRoleBadgeColor(u.role)} variant="light">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        color={u.isActive ? "success" : "light"}
                        variant="light"
                      >
                        {u.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(u.lastLoginAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Empty state */}
        {!loading && totalCount === 0 && (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Kriterlere uyan admin kullanıcı bulunamadı.
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Toplam {totalCount} kayıt • Sayfa {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Önceki
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <AdminUserDetailModal
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUserUpdated}
        />
      )}

      {/* Create Modal */}
      {createOpen && (
        <CreateAdminUserModal
          onClose={() => setCreateOpen(false)}
          onCreated={handleUserCreated}
        />
      )}
    </>
  );
}