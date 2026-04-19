import Link from "next/link";
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
  date: string; // dd.MM.yyyy HH:mm
  amount: string;
  status: BookingStatus;
}

const tableData: Booking[] = [
  {
    id: 1,
    pnr: "A3B7K2",
    passenger: "Ahmet Yılmaz",
    route: "IST → JFK",
    date: "19.04.2026 14:32",
    amount: "₺18.450",
    status: "Onaylandı",
  },
  {
    id: 2,
    pnr: "X9M4P1",
    passenger: "Fatma Demir",
    route: "SAW → AMS",
    date: "19.04.2026 13:18",
    amount: "₺4.280",
    status: "Bekliyor",
  },
  {
    id: 3,
    pnr: "Q7R2T5",
    passenger: "Mehmet Kaya",
    route: "ESB → IST",
    date: "19.04.2026 12:05",
    amount: "₺1.650",
    status: "Onaylandı",
  },
  {
    id: 4,
    pnr: "L6W8N3",
    passenger: "Zeynep Öztürk",
    route: "IST → LHR",
    date: "19.04.2026 10:47",
    amount: "₺9.820",
    status: "Hata",
  },
  {
    id: 5,
    pnr: "V2K5H9",
    passenger: "Ali Çelik",
    route: "AYT → IST",
    date: "19.04.2026 09:22",
    amount: "₺2.340",
    status: "İptal",
  },
  {
    id: 6,
    pnr: "B4J1S8",
    passenger: "Ayşe Arslan",
    route: "IST → DXB",
    date: "19.04.2026 08:15",
    amount: "₺6.750",
    status: "Onaylandı",
  },
];

const statusColor = (status: BookingStatus): "success" | "warning" | "error" => {
  switch (status) {
    case "Onaylandı":
      return "success";
    case "Bekliyor":
      return "warning";
    case "İptal":
    case "Hata":
      return "error";
  }
};

export default function RecentBookings() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Son Rezervasyonlar
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Bugünün son işlemleri
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Tümünü Gör
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                PNR
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Yolcu
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Güzergah
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tarih
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tutar
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Durum
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="py-3">
                  <span className="font-mono font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                    {b.pnr}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                  {b.passenger}
                </TableCell>
                <TableCell className="py-3 text-gray-700 text-theme-sm dark:text-gray-300">
                  <span className="font-medium">{b.route}</span>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {b.date}
                </TableCell>
                <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {b.amount}
                </TableCell>
                <TableCell className="py-3 text-theme-sm">
                  <Badge size="sm" color={statusColor(b.status)}>
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}