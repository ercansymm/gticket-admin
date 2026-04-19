import type { Metadata } from "next";
import React from "react";
import { DashboardMetrics } from "@/components/ecommerce/DashboardMetrics";
import RevenueChart from "@/components/ecommerce/RevenueChart";
import RecentBookings from "@/components/ecommerce/RecentBookings";

export const metadata: Metadata = {
  title: "Dashboard | ATABİLET Admin",
  description: "ATABİLET Admin Panel - Genel Bakış",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Hoş geldin !
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Bugünkü operasyonel özet aşağıda.
        </p>
      </div>

      <DashboardMetrics />

      <RevenueChart />

      <RecentBookings />
    </div>
  );
}