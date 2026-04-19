import type { Metadata } from "next";
import BookingsTable from "@/components/bookings/BookingsTable";

export const metadata: Metadata = {
  title: "Rezervasyonlar | ATABİLET Admin",
  description: "Tüm rezervasyonları görüntüle ve yönet",
};

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Rezervasyonlar
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tüm rezervasyonları görüntüle, ara ve filtrele.
        </p>
      </div>

      <BookingsTable />
    </div>
  );
}