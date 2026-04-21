import type { Metadata } from "next";
import AdminUsersTable from "@/components/admin-users/AdminUsersTable";

export const metadata: Metadata = {
  title: "Admin Kullanıcıları | ATABİLET Admin",
  description: "Admin panel kullanıcılarını yönet",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Admin Kullanıcıları
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Sistem yöneticilerini görüntüle, ekle ve yönet.
        </p>
      </div>

      <AdminUsersTable />
    </div>
  );
}