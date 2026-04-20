import type { Metadata } from "next";
import CustomersTable from "@/components/customers/CustomersTable";

export const metadata: Metadata = {
  title: "Müşteriler | ATABİLET Admin",
  description: "Tüm müşterileri görüntüle ve yönet",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Müşteriler
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Rezervasyon yapmış kullanıcıların listesi
        </p>
      </div>

      <CustomersTable />
    </div>
  );
}