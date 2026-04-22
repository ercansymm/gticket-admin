"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { dashboardApi } from "@/lib/dashboard";
import type { DashboardRecentSupportTicket } from "@/types/support-tickets";

// Minimal DTO, backend'e göre güncellenebilir


// Artık DashboardRecentSupportTicket tipi kullanılacak

type BadgeColor = "success" | "warning" | "error" | "info";

const STATUS_LABELS: Record<string, string> = {
  Open: "Açık",
  Closed: "Kapalı",
  Pending: "Bekliyor",
  Resolved: "Çözüldü",
  Waiting: "Yanıt Bekliyor",
  InProgress: "İşlemde",
  Cancelled: "İptal",
  Error: "Hata",
};

function statusBadge(status: string): { color: BadgeColor; label: string } {
  const label = STATUS_LABELS[status] ?? status;
  const s = status.toLowerCase();
  if (["closed", "resolved"].includes(s)) {
    return { color: "success", label };
  }
  if (["open", "pending", "waiting", "inprogress"].includes(s)) {
    return { color: "warning", label };
  }
  if (["cancelled", "error"].includes(s)) {
    return { color: "error", label };
  }
  return { color: "info", label };
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}


export default function RecentSupportTickets() {
  const [tickets, setTickets] = useState<DashboardRecentSupportTicket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.recentSupportTickets(10);
      setTickets(data.items ?? []);
    } catch (err) {
      setError("Son destek talepleri yüklenemedi.");
      setTickets(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 mt-8">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Son Destek Talepleri
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            En son oluşturulan 10 destek talebi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/support-tickets"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : error || !tickets ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50 px-4 py-8 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <span>{error ?? "Son destek talepleri yüklenemedi."}</span>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Tekrar dene
          </button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.02] dark:text-gray-400">
          Henüz destek talebi yok
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Ticket No</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Konu</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Müşteri</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Durum</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Oluşturulma</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Son Aktivite</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tickets.map((t) => {
                const badge = statusBadge(t.status);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="py-3 font-mono font-semibold text-gray-800 text-theme-sm dark:text-white/90">{t.ticketNumber}</TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">{t.subject}</TableCell>
                    <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">{t.userFullName}</TableCell>
                    <TableCell className="py-3 text-theme-sm">
                      <Badge size="sm" color={badge.color}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(t.createdAt)}</TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(t.lastActivityAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
