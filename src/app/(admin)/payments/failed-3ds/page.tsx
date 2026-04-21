import type { Metadata } from "next";
import Failed3DTable from "@/components/payments/Failed3DTable";

export const metadata: Metadata = {
  title: "3D Başarısız Ödemeler | ATABİLET Admin",
  description: "3D Secure aşamasında başarısız olan ödemeler",
};

export default function Failed3DPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          3D Başarısız Ödemeler
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          3D Secure aşamasında başarısız olan ödemeleri kategorisine göre
          incele.
        </p>
      </div>

      <Failed3DTable />
    </div>
  );
}
