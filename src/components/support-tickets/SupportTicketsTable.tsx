// Destek Talepleri Tablosu
// Pattern: AdminUsersTable.tsx (filtre + arama + pagination + satıra tıklayınca modal)

"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Inbox } from "lucide-react";
import { listSupportTickets } from "@/lib/supportTickets";
import {
  SupportTicketListItemDto,
  SupportTicketStatus,
  SupportTicketType,
  SupportTicketTypeLabels,
  SupportTicketStatusLabels,
  SupportTicketTypeBadgeColor,
  SupportTicketStatusBadgeColor,
} from "@/types/supportTicket";
import SupportTicketDetailModal from "./SupportTicketDetailModal";

// Badge — AdminUsersTable ile aynı stil
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

function Badge({
  color,
  children,
}: {
  color: BadgeColor;
  children: React.ReactNode;
}) {
  const colorMap: Record<BadgeColor, string> = {
    primary: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/30",
    success: "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-500/15 dark:text-green-400 dark:ring-green-500/30",
    error: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",
    info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:ring-sky-500/30",
    light: "bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:ring-gray-500/30",
    dark: "bg-gray-800 text-white ring-1 ring-gray-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("tr-TR", {
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

export default function SupportTicketsTable() {
  const [tickets, setTickets] = useState<SupportTicketListItemDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<SupportTicketType | "all">("all");

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listSupportTickets({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter === "all" ? null : statusFilter,
        type: typeFilter === "all" ? null : typeFilter,
        search: search || null,
      });
      setTickets(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setTickets([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Arama inputu için debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? "all" : (value as SupportTicketStatus));
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value === "all" ? "all" : (value as SupportTicketType));
    setPage(1);
  };

  const handleRowClick = (ticket: SupportTicketListItemDto) => {
    setSelectedTicketId(ticket.id);
  };

  const handleModalClose = (changed: boolean) => {
    setSelectedTicketId(null);
    if (changed) {
      fetchTickets();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Filtre barı */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Arama */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ticket no, konu, PNR, müşteri..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 sm:w-72"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter === "all" ? "all" : statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">Tüm Durumlar</option>
            <option value={SupportTicketStatus.Open}>Açık</option>
            <option value={SupportTicketStatus.Closed}>Kapalı</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter === "all" ? "all" : typeFilter}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            <option value="all">Tüm Tipler</option>
            <option value={SupportTicketType.Refund}>İade</option>
            <option value={SupportTicketType.Change}>Değişiklik</option>
            <option value={SupportTicketType.Complaint}>Şikayet</option>
            <option value={SupportTicketType.Technical}>Teknik</option>
          </select>
        </div>

        {/* Yenile butonu */}
        <button
          type="button"
          onClick={fetchTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      {/* Hata */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-gray-200 text-xs font-medium uppercase text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Ticket No</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Konu</th>
              <th className="px-4 py-3">PNR</th>
              <th className="px-4 py-3">Son Aktivite</th>
              <th className="px-4 py-3 text-center">Mesaj</th>
              <th className="px-4 py-3">Durum</th>
            </tr>
          </thead>
          <tbody>
            {loading && tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <Inbox className="h-8 w-8 opacity-50" />
                    <span>Kayıt bulunamadı</span>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => handleRowClick(ticket)}
                  className="cursor-pointer border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                    {ticket.ticketNumber}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={SupportTicketTypeBadgeColor[ticket.type]}>
                      {SupportTicketTypeLabels[ticket.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-800 dark:text-gray-100">{ticket.customerFullName}</span>
                        {ticket.isGuest && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
                            Misafir
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.isGuest
                          ? (ticket.guestEmail ?? <span className="italic text-gray-400">e-posta yok</span>)
                          : ticket.customerEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    <span className="line-clamp-1">{ticket.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {ticket.pnr || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatDate(ticket.lastActivityAt)}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                    {ticket.messageCount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={SupportTicketStatusBadgeColor[ticket.status]}>
                      {SupportTicketStatusLabels[ticket.status]}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {tickets.length > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Toplam {totalCount} kayıt · Sayfa {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Önceki
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      {/* Detay Modal */}
      {selectedTicketId && (
        <SupportTicketDetailModal
          ticketId={selectedTicketId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}