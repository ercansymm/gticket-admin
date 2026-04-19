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

type CustomerStatus = "Aktif" | "Pasif";

interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
  status: CustomerStatus;
}

const allCustomers: Customer[] = [
  { id: 1, fullName: "Ahmet Yılmaz", email: "ahmet.yilmaz@gmail.com", phone: "+90 532 445 1122", totalBookings: 12, lastBooking: "19.04.2026", status: "Aktif" },
  { id: 2, fullName: "Fatma Demir", email: "fatma.demir@outlook.com", phone: "+90 505 334 8890", totalBookings: 7, lastBooking: "19.04.2026", status: "Aktif" },
  { id: 3, fullName: "Mehmet Kaya", email: "mkaya@hotmail.com", phone: "+90 543 221 5678", totalBookings: 23, lastBooking: "19.04.2026", status: "Aktif" },
  { id: 4, fullName: "Zeynep Öztürk", email: "zeynep.ozturk@gmail.com", phone: "+90 535 889 3344", totalBookings: 4, lastBooking: "19.04.2026", status: "Aktif" },
  { id: 5, fullName: "Ali Çelik", email: "ali.celik@yandex.com", phone: "+90 538 112 6677", totalBookings: 1, lastBooking: "19.04.2026", status: "Pasif" },
  { id: 6, fullName: "Ayşe Arslan", email: "ayse.arslan@gmail.com", phone: "+90 541 667 9988", totalBookings: 15, lastBooking: "19.04.2026", status: "Aktif" },
  { id: 7, fullName: "Emre Şahin", email: "emre.sahin@icloud.com", phone: "+90 533 445 7766", totalBookings: 9, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 8, fullName: "Elif Kurt", email: "elif.kurt@gmail.com", phone: "+90 542 223 4455", totalBookings: 3, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 9, fullName: "Burak Aydın", email: "burak.aydin@outlook.com", phone: "+90 537 881 2233", totalBookings: 18, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 10, fullName: "Selin Koç", email: "selin.koc@gmail.com", phone: "+90 544 556 7788", totalBookings: 6, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 11, fullName: "Oğuz Tekin", email: "oguz.tekin@hotmail.com", phone: "+90 531 779 1234", totalBookings: 2, lastBooking: "18.04.2026", status: "Pasif" },
  { id: 12, fullName: "Merve Polat", email: "merve.polat@gmail.com", phone: "+90 546 223 8899", totalBookings: 11, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 13, fullName: "Cem Yıldırım", email: "cem.yildirim@yandex.com", phone: "+90 539 998 4455", totalBookings: 5, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 14, fullName: "Derya Şen", email: "derya.sen@gmail.com", phone: "+90 534 114 5566", totalBookings: 8, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 15, fullName: "Kaan Erdoğan", email: "kaan.erdogan@outlook.com", phone: "+90 545 667 2233", totalBookings: 14, lastBooking: "18.04.2026", status: "Aktif" },
  { id: 16, fullName: "Pınar Acar", email: "pinar.acar@icloud.com", phone: "+90 547 334 8899", totalBookings: 21, lastBooking: "17.04.2026", status: "Aktif" },
  { id: 17, fullName: "Tolga Kılıç", email: "tolga.kilic@gmail.com", phone: "+90 532 556 1199", totalBookings: 3, lastBooking: "17.04.2026", status: "Aktif" },
  { id: 18, fullName: "Gizem Bulut", email: "gizem.bulut@hotmail.com", phone: "+90 549 778 4422", totalBookings: 6, lastBooking: "17.04.2026", status: "Aktif" },
  { id: 19, fullName: "Barış Özdemir", email: "baris.ozdemir@gmail.com", phone: "+90 536 229 8877", totalBookings: 10, lastBooking: "17.04.2026", status: "Aktif" },
  { id: 20, fullName: "Nihan Aksoy", email: "nihan.aksoy@outlook.com", phone: "+90 548 112 3344", totalBookings: 7, lastBooking: "17.04.2026", status: "Aktif" },
];

const STATUS_FILTERS: Array<"Tümü" | CustomerStatus> = ["Tümü", "Aktif", "Pasif"];
const PAGE_SIZE = 10;

export default function CustomersTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tümü" | CustomerStatus>("Tümü");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allCustomers.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
      const matchesStatus = statusFilter === "Tümü" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // İsim → monogram (avatar için)
  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

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
            placeholder="Ad, e-posta veya telefon ara..."
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
              {["Müşteri", "E-posta", "Telefon", "Rezervasyon", "Son İşlem", "Durum"].map((h) => (
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
              pageItems.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition"
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
                  <TableCell className="px-4 py-3 text-gray-700 text-theme-sm dark:text-gray-300 sm:px-6">
                    <span className="font-mono">{c.phone}</span>
                  </TableCell>
                  <TableCell className="px-4 py-3 sm:px-6">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-theme-sm font-semibold dark:bg-gray-800 dark:text-gray-300">
                      {c.totalBookings}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sm:px-6">
                    {c.lastBooking}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-theme-sm sm:px-6">
                    <Badge size="sm" color={c.status === "Aktif" ? "success" : "error"}>
                      {c.status}
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
          Toplam <span className="font-semibold text-gray-800 dark:text-white/90">{filtered.length}</span> müşteri
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