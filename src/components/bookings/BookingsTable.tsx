"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

type BookingStatus = "Onaylandı" | "Bekliyor" | "İptal" | "Hata";

interface Booking {
  id: number;
  pnr: string;
  passenger: string;
  route: string;
  date: string;
  amount: string;
  status: BookingStatus;
}

// Sahte data — 20 satır
const allBookings: Booking[] = [
  { id: 1, pnr: "A3B7K2", passenger: "Ahmet Yılmaz", route: "IST → JFK", date: "19.04.2026 14:32", amount: "₺18.450", status: "Onaylandı" },
  { id: 2, pnr: "X9M4P1", passenger: "Fatma Demir", route: "SAW → AMS", date: "19.04.2026 13:18", amount: "₺4.280", status: "Bekliyor" },
  { id: 3, pnr: "Q7R2T5", passenger: "Mehmet Kaya", route: "ESB → IST", date: "19.04.2026 12:05", amount: "₺1.650", status: "Onaylandı" },
  { id: 4, pnr: "L6W8N3", passenger: "Zeynep Öztürk", route: "IST → LHR", date: "19.04.2026 10:47", amount: "₺9.820", status: "Hata" },
  { id: 5, pnr: "V2K5H9", passenger: "Ali Çelik", route: "AYT → IST", date: "19.04.2026 09:22", amount: "₺2.340", status: "İptal" },
  { id: 6, pnr: "B4J1S8", passenger: "Ayşe Arslan", route: "IST → DXB", date: "19.04.2026 08:15", amount: "₺6.750", status: "Onaylandı" },
  { id: 7, pnr: "H2G5F9", passenger: "Emre Şahin", route: "IST → CDG", date: "18.04.2026 22:47", amount: "₺8.120", status: "Onaylandı" },
  { id: 8, pnr: "T1N4M7", passenger: "Elif Kurt", route: "ADB → IST", date: "18.04.2026 20:31", amount: "₺1.890", status: "Onaylandı" },
  { id: 9, pnr: "C8D2K3", passenger: "Burak Aydın", route: "IST → FRA", date: "18.04.2026 19:08", amount: "₺7.340", status: "Bekliyor" },
  { id: 10, pnr: "P5R9J6", passenger: "Selin Koç", route: "SAW → BER", date: "18.04.2026 17:55", amount: "₺5.680", status: "Onaylandı" },
  { id: 11, pnr: "W3E7L1", passenger: "Oğuz Tekin", route: "IST → BAH", date: "18.04.2026 16:42", amount: "₺11.250", status: "Hata" },
  { id: 12, pnr: "Y6U4I8", passenger: "Merve Polat", route: "IST → MUC", date: "18.04.2026 15:13", amount: "₺6.920", status: "Onaylandı" },
  { id: 13, pnr: "K1J3S5", passenger: "Cem Yıldırım", route: "ESB → AYT", date: "18.04.2026 13:27", amount: "₺1.450", status: "Onaylandı" },
  { id: 14, pnr: "D9F2H6", passenger: "Derya Şen", route: "IST → VIE", date: "18.04.2026 11:48", amount: "₺5.470", status: "İptal" },
  { id: 15, pnr: "N8M5B2", passenger: "Kaan Erdoğan", route: "SAW → SOF", date: "18.04.2026 10:22", amount: "₺3.890", status: "Onaylandı" },
  { id: 16, pnr: "Z4X7C1", passenger: "Pınar Acar", route: "IST → BKK", date: "17.04.2026 23:55", amount: "₺22.340", status: "Onaylandı" },
  { id: 17, pnr: "R2T6Y8", passenger: "Tolga Kılıç", route: "IST → MAD", date: "17.04.2026 22:18", amount: "₺7.890", status: "Bekliyor" },
  { id: 18, pnr: "U9O3P7", passenger: "Gizem Bulut", route: "ADB → IST", date: "17.04.2026 20:45", amount: "₺1.950", status: "Onaylandı" },
  { id: 19, pnr: "A5S8D4", passenger: "Barış Özdemir", route: "IST → DOH", date: "17.04.2026 19:12", amount: "₺13.670", status: "Hata" },
  { id: 20, pnr: "G6H2J9", passenger: "Nihan Aksoy", route: "IST → SVO", date: "17.04.2026 17:33", amount: "₺8.450", status: "Onaylandı" },
];

const statusColor = (status: BookingStatus): "success" | "warning" | "error" => {
  switch (status) {
    case "Onaylandı": return "success";
    case "Bekliyor": return "warning";
    case "İptal":
    case "Hata": return "error";
  }
};

const STATUS_FILTERS: Array<"Tümü" | BookingStatus> = [
  "Tümü",
  "Onaylandı",
  "Bekliyor",
  "İptal",
  "Hata",
];

const PAGE_SIZE = 10;

export default function BookingsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tümü" | BookingStatus>("Tümü");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allBookings.filter((b) => {
      const matchesSearch =
        search === "" ||
        b.pnr.toLowerCase().includes(search.toLowerCase()) ||
        b.passenger.toLowerCase().includes(search.toLowerCase()) ||
        b.route.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Tümü" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Filtreler */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="PNR, yolcu veya güzergah ara..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                statusFilter === s
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-b">
            <TableRow>
              {["PNR", "Yolcu", "Güzergah", "Tarih", "Tutar", "Durum"].map((h) => (
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
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-10 text-center text-gray-500 text-theme-sm sm:px-6">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((b) => (
                <TableRow
                  key={b.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition"
                >
                  <TableCell className="px-4 py-3 sm:px-6">
                    <span className="font-mono font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                      {b.pnr}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                    {b.passenger}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                    <span className="font-medium">{b.route}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-6">
                    {b.date}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90 sm:px-6">
                    {b.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm sm:px-6">
                    <Badge size="sm" color={statusColor(b.status)}>
                      {b.status}
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
          Toplam <span className="font-semibold text-gray-800 dark:text-white/90">{filtered.length}</span> kayıt
          {filtered.length > 0 && (
            <>
              {" "}— Sayfa{" "}
              <span className="font-semibold text-gray-800 dark:text-white/90">{currentPage}</span>/{totalPages}
            </>
          )}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Önceki
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}