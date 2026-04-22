// Destek Talepleri — sayfa wrapper'ı
// Route: /support-tickets

"use client";

import SupportTicketsTable from "@/components/support-tickets/SupportTicketsTable";

export default function SupportTicketsPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Destek Talepleri
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Müşterilerden gelen iade, değişiklik, şikayet ve teknik destek taleplerini yönetin.
        </p>
      </div>
      <SupportTicketsTable />
    </div>
  );
}