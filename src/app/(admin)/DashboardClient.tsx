"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardMetrics } from "@/components/ecommerce/DashboardMetrics";
import RevenueChart from "@/components/ecommerce/RevenueChart";
import RecentBookings from "@/components/ecommerce/RecentBookings";
import RecentSupportTickets from "@/components/support-tickets/RecentSupportTickets";   

export default function DashboardClient() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isLimited = user?.role === "CallCenter" || user?.role === "ReadOnly";
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
      {isSuperAdmin && <DashboardMetrics />}
      {isSuperAdmin && <RevenueChart />}
      <RecentBookings />
      <RecentSupportTickets />
    </div>
  );
}
