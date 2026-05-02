"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardMetrics } from "@/components/ecommerce/DashboardMetrics";
import RevenueChart from "@/components/ecommerce/RevenueChart";
import RecentBookings from "@/components/ecommerce/RecentBookings";
import RecentSupportTickets from "@/components/support-tickets/RecentSupportTickets";

export default function DashboardClient() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const isBlogEditor = user?.role === "BlogEditor";

  useEffect(() => {
    if (isBlogEditor) {
      router.replace("/blog-posts");
    }
  }, [isBlogEditor, router]);

  if (isBlogEditor) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Hoş geldin!
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
