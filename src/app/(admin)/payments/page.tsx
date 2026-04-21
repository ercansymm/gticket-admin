import type { Metadata } from "next";
import PaymentsTable from "@/components/payments/PaymentsTable";

export const metadata: Metadata = {
  title: "Ödemeler | ATABİLET Admin",
  description: "Tüm ödemeleri görüntüle ve yönet",
};

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Ödemeler
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tüm ödeme işlemlerini görüntüle, ara ve filtrele.
        </p>
      </div>

      <PaymentsTable />
    </div>
  );
}
