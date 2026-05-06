// Destek Talebi Detay Modal
// Pattern: AdminUserDetailModal / BookingDetailModal
// - bg-black/50 overlay, items-start pt-10, max-w-2xl rounded-2xl border, z-999999
// - Header: sol tarafta title + badge'ler, sağda X
// - Orta: ticket bilgileri + mesajlaşma arayüzü (sohbet benzeri)
// - Alt: yanıt textarea + gönder butonu (Open durumundayken)
// - Header sağda "Talebi Kapat" (inline confirm)

"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2, Send, AlertCircle } from "lucide-react";
import {
  getSupportTicketById,
  addSupportTicketMessage,
  closeSupportTicket,
} from "@/lib/supportTickets";
import { useAuth } from "@/context/AuthContext";
import {
  SupportTicketDetailDto,
  SupportTicketStatus,
  SupportMessageSenderType,
  SupportTicketTypeLabels,
  SupportTicketStatusLabels,
  SupportTicketTypeBadgeColor,
  SupportTicketStatusBadgeColor,
} from "@/types/supportTicket";

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "light" | "dark";

function Badge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
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

interface Props {
  ticketId: string;
  onClose: (changed: boolean) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
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

export default function SupportTicketDetailModal({ ticketId, onClose }: Props) {
  const { user } = useAuth();
  const canWrite = user?.role === "SuperAdmin" || user?.role === "CallCenter";

  const [ticket, setTicket] = useState<SupportTicketDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [confirmClose, setConfirmClose] = useState(false);
  const [closing, setClosing] = useState(false);

  // Bir şey değiştiyse (mesaj eklendi / kapatıldı) parent'a bildirmek için flag
  const [changedFlag, setChangedFlag] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch detail
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSupportTicketById(ticketId);
        if (!cancelled) setTicket(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ticketId]);

  // Mesaj listesi güncellendiğinde aşağı scroll
  useEffect(() => {
    if (ticket && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [ticket?.messages.length]);

  // ESC ile kapama
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changedFlag]);

  function handleClose() {
    onClose(changedFlag);
  }

  async function handleSendReply() {
    if (!ticket || !replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      const updated = await addSupportTicketMessage(ticket.id, {
        message: replyText.trim(),
      });
      setTicket(updated);
      setReplyText("");
      setChangedFlag(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mesaj gönderilemedi");
    } finally {
      setSending(false);
    }
  }

  async function handleCloseTicket() {
    if (!ticket) return;
    setClosing(true);
    setError(null);
    try {
      const updated = await closeSupportTicket(ticket.id);
      setTicket(updated);
      setChangedFlag(true);
      setConfirmClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Talep kapatılamadı");
    } finally {
      setClosing(false);
    }
  }

  const isOpen = ticket?.status === SupportTicketStatus.Open;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-10 pb-10"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {ticket?.ticketNumber || "Yükleniyor..."}
              </h2>
              {ticket && (
                <>
                  <Badge color={SupportTicketTypeBadgeColor[ticket.type]}>
                    {SupportTicketTypeLabels[ticket.type]}
                  </Badge>
                  <Badge color={SupportTicketStatusBadgeColor[ticket.status]}>
                    {SupportTicketStatusLabels[ticket.status]}
                  </Badge>
                </>
              )}
            </div>
            {ticket && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {ticket.subject}
              </p>
            )}
          </div>

          {/* Sağ: Kapat butonu + X */}
          <div className="flex items-center gap-2 shrink-0">
 {isOpen && canWrite && (
              <>
                {!confirmClose ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClose(true)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
                  >
                    Talebi Kapat
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      disabled={closing}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      {closing ? "Kapatılıyor..." : "Evet, kapat"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClose(false)}
                      disabled={closing}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Vazgeç
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        ) : error && !ticket ? (
          <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-500/10 dark:text-red-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : ticket ? (
          <>
            {/* Müşteri + Rezervasyon bilgileri */}
            <div className="grid grid-cols-1 gap-4 border-b border-gray-200 px-6 py-4 text-sm sm:grid-cols-2 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Müşteri</span>
                  {ticket.isGuest && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30">
                      Misafir
                    </span>
                  )}
                </div>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {ticket.customerFullName}
                </div>
                {ticket.isGuest ? (
                  ticket.guestEmail ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {ticket.guestEmail}
                    </div>
                  ) : (
                    <div className="text-xs italic text-gray-400 dark:text-gray-500">
                      E-posta belirtilmedi
                    </div>
                  )
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.customerEmail}
                  </div>
                )}
                {ticket.customerPhone && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.customerPhone}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Rezervasyon</div>
                {ticket.pnr ? (
                  <>
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      PNR: {ticket.pnr}
                    </div>
                    {ticket.route && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.route}</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">—</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Oluşturulma</div>
                <div className="text-gray-700 dark:text-gray-300">{formatDate(ticket.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  {ticket.status === SupportTicketStatus.Closed ? "Kapatılma" : "Son Aktivite"}
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  {ticket.status === SupportTicketStatus.Closed && ticket.closedAt
                    ? formatDate(ticket.closedAt)
                    : formatDate(ticket.lastActivityAt)}
                </div>
              </div>
            </div>

            {/* Mesajlaşma */}
            <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-3 bg-gray-50 dark:bg-gray-950/40">
              {ticket.messages.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">Mesaj yok</div>
              ) : (
                ticket.messages.map((msg) => {
                  const isAdmin = msg.senderType === SupportMessageSenderType.Admin;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                          isAdmin
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                        }`}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            isAdmin ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {msg.senderName} · {formatDate(msg.createdAt)}
                        </div>
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hata (aksiyon sırasında oluşan) */}
            {error && ticket && (
              <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/50 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

{/* Yanıt kutusu */}
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              {isOpen && canWrite ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Yanıtınızı yazın..."
                    rows={3}
                    disabled={sending}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {sending ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                </div>
) : (
                <div className="rounded-lg bg-gray-100 px-3 py-2.5 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {!isOpen
                    ? "Bu talep kapatılmıştır. Yeni mesaj eklenemez."
                    : "Görüntüleme yetkiniz var, yanıt gönderemezsiniz."}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}