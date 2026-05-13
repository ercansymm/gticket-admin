"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bookingsApi } from "@/lib/bookings";
import type {
  AdminBookingDetail,
  BookingFieldChange,
  SyncPreviewResult,
} from "@/types/admin";

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

function formatDepartureDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

type SyncState = "idle" | "loading" | "done" | "error";

export default function BookingDetailClient({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [preview, setPreview] = useState<SyncPreviewResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<SyncState>("idle");
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  useEffect(() => {
    bookingsApi
      .get(bookingId)
      .then(setBooking)
      .catch(() => setBookingError("Rezervasyon yüklenemedi."))
      .finally(() => setLoadingBooking(false));
  }, [bookingId]);

  const handlePreview = async () => {
    setSyncState("loading");
    setSyncError(null);
    setPreview(null);
    try {
      const result = await bookingsApi.syncPreview(bookingId);
      setPreview(result);
      setSyncState("done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kontrol başarısız";
      setSyncError(msg);
      setSyncState("error");
    }
  };

  const handleConfirm = async () => {
    setConfirmState("loading");
    setConfirmMsg(null);
    try {
      const res = await bookingsApi.syncConfirm(bookingId);
      setConfirmMsg(res.message);
      setConfirmState("done");
      // Rezervasyonu yenile
      const updated = await bookingsApi.get(bookingId);
      setBooking(updated);
      setPreview(null);
      setSyncState("idle");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Güncelleme başarısız";
      setConfirmMsg(msg);
      setConfirmState("error");
    }
  };

  if (loadingBooking) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#047857]" />
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        {bookingError ?? "Rezervasyon bulunamadı."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/bookings" className="hover:text-[#047857]">Rezervasyonlar</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-white">{booking.pnr ?? booking.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            {booking.route}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            PNR: <span className="font-mono font-semibold">{booking.pnr ?? "—"}</span>
            {booking.internalPnr && (
              <> · İç PNR: <span className="font-mono">{booking.internalPnr}</span></>
            )}
          </p>
        </div>
        <StatusBadge status={booking.statusCategory} />
      </div>

      {/* Info grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Tutar", value: `${booking.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ${booking.currency}` },
          { label: "Durum", value: booking.status },
          { label: "Yetişkin / Çocuk / Bebek", value: `${booking.adultCount} / ${booking.childCount} / ${booking.infantCount}` },
          { label: "Oluşturulma", value: formatDate(booking.createdAt) },
          { label: "Biletleme", value: formatDate(booking.ticketedAt) },
          { label: "İptal", value: formatDate(booking.cancelledAt) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-white/[0.03]">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 font-semibold text-gray-800 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Yolcular */}
      <Section title="Yolcular">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-white/5">
            <tr>
              {["Ad Soyad", "Tip", "Doğum Tarihi", "Email", "Bilet No"].map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {booking.passengers.map((p) => (
              <tr key={p.id}>
                <Td>{p.firstName} {p.lastName}</Td>
                <Td>{p.passengerType}</Td>
                <Td>{p.birthDate ?? "—"}</Td>
                <Td>{p.email ?? "—"}</Td>
                <Td>{/* ticket no passenger'da yok, segment'ten geliyor */}—</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Uçuş Segmentleri */}
      {booking.flightSegments?.length > 0 && (
        <Section title="Uçuş Segmentleri">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {["#", "Rota", "Kalkış", "Saat", "Uçuş No", "Bagaj"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {booking.flightSegments.map((s) => (
                <tr key={s.id}>
                  <Td>{s.sequenceNo}</Td>
                  <Td>{s.originCode} → {s.destinationCode}</Td>
                  <Td>{formatDepartureDate(s.departureDate)}</Td>
                  <Td>{s.departureTime ?? "—"}</Td>
                  <Td>{s.marketingAirline}{s.flightNumber}</Td>
                  <Td>{s.baggage ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* BiletBank Senkronizasyonu */}
      <Section title="BiletBank Senkronizasyonu">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acente panelinden değişikliği yaptıktan sonra aşağıdaki butona basın.
            Sistem BiletBank'taki güncel durumu DB ile karşılaştırır.
          </p>

          <button
            onClick={handlePreview}
            disabled={syncState === "loading"}
            className="rounded-lg bg-[#0a1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a1628]/80 disabled:opacity-50"
          >
            {syncState === "loading" ? "Kontrol ediliyor…" : "Değişiklik Kontrol Et"}
          </button>

          {syncState === "error" && syncError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {syncError}
            </div>
          )}

          {syncState === "done" && preview && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700">
              {preview.hasChanges ? (
                <>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-white/5">
                      <tr>
                        <Th>Alan</Th>
                        <Th>Mevcut (DB)</Th>
                        <Th>BiletBank</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {preview.changes.map((c: BookingFieldChange, i: number) => (
                        <tr key={i}>
                          <Td>{c.fieldName}</Td>
                          <Td><span className="text-red-600 line-through">{c.oldValue}</span></Td>
                          <Td><span className="font-semibold text-[#047857]">{c.newValue}</span></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                    <button
                      onClick={handleConfirm}
                      disabled={confirmState === "loading" || confirmState === "done"}
                      className="rounded-lg bg-[#047857] px-4 py-2 text-sm font-semibold text-white hover:bg-[#047857]/80 disabled:opacity-50"
                    >
                      {confirmState === "loading" ? "Güncelleniyor…" : "Onayla ve Email Gönder"}
                    </button>

                    {confirmMsg && (
                      <p className={`mt-2 text-sm ${confirmState === "done" ? "text-[#047857]" : "text-red-600"}`}>
                        {confirmMsg}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    BiletBank&apos;ta değişiklik tespit edilmedi. Önce acente panelinden işlemi gerçekleştirin.
                  </p>
                  <button
                    disabled
                    className="mt-3 rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
                  >
                    Onayla ve Email Gönder
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* Değişiklik Geçmişi */}
      {booking.changeLog?.length > 0 && (
        <Section title="Değişiklik Geçmişi">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {["Tarih", "Alan", "Eski", "Yeni"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {booking.changeLog.map((c) => (
                <tr key={c.id}>
                  <Td>{formatDate(c.changedAt)}</Td>
                  <Td>{c.fieldName}</Td>
                  <Td><span className="text-red-600">{c.oldValue ?? "—"}</span></Td>
                  <Td><span className="text-[#047857] font-semibold">{c.newValue ?? "—"}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* İşlem Logları */}
      {booking.logs?.length > 0 && (
        <Section title="İşlem Logları">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5">
              <tr>
                {["Tarih", "İşlem", "Durum", "Süre (ms)"].map((h) => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {booking.logs.map((l, i) => (
                <tr key={i}>
                  <Td>{formatDate(l.createdAt)}</Td>
                  <Td className="font-mono text-xs">{l.operation}</Td>
                  <Td>
                    <span className={`font-semibold ${l.isSuccess ? "text-[#047857]" : "text-red-600"}`}>
                      {l.isSuccess ? "Başarılı" : "Hata"}
                    </span>
                    {l.errorMessage && <span className="ml-2 text-gray-500">{l.errorMessage}</span>}
                  </Td>
                  <Td>{l.responseTimeMs ?? "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${className ?? ""}`}>
      {children}
    </td>
  );
}
