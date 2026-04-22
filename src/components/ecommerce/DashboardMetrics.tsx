"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { dashboardApi } from "@/lib/dashboard";
import type { DashboardStats } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

const formatTRY = (val: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(val);

const formatNumber = (val: number) =>
  new Intl.NumberFormat("tr-TR").format(val);

interface CardConfig {
  key: keyof Pick<
    DashboardStats,
    "totalBookings" | "totalRevenue" | "totalCustomers" | "activeUsers"
  >;
  changeKey: keyof Pick<
    DashboardStats,
    | "bookingsChangePercent"
    | "revenueChangePercent"
    | "customersChangePercent"
    | "activeUsersChangePercent"
  >;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  format: (n: number) => string;
}

const CARDS: CardConfig[] = [
  {
    key: "totalBookings",
    changeKey: "bookingsChangePercent",
    label: "Toplam Rezervasyon",
    icon: <BoxIconLine className="text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    format: formatNumber,
  },
  {
    key: "totalRevenue",
    changeKey: "revenueChangePercent",
    label: "Toplam Gelir",
    icon: <BoxIconLine className="text-amber-600 dark:text-amber-400" />,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    format: formatTRY,
  },
  {
    key: "totalCustomers",
    changeKey: "customersChangePercent",
    label: "Toplam Müşteri",
    icon: <GroupIcon className="text-sky-600 size-6 dark:text-sky-400" />,
    iconBg: "bg-sky-50 dark:bg-sky-500/10",
    format: formatNumber,
  },
  {
    key: "activeUsers",
    changeKey: "activeUsersChangePercent",
    label: "Aktif Kullanıcı (30 gün)",
    icon: <GroupIcon className="text-violet-600 size-6 dark:text-violet-400" />,
    iconBg: "bg-violet-50 dark:bg-violet-500/10",
  format: formatNumber,
  },
];

const cardWrapperCls =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6";

function ChangeBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const tone = isUp
    ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
    : "text-rose-700 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400";
  const display = `${isUp ? "+" : ""}${value.toFixed(1)}%`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
    >
      {isUp ? (
        <ArrowUpIcon />
      ) : (
        <ArrowDownIcon className="text-rose-600 dark:text-rose-400" />
      )}
      {display}
    </span>
  );
}

export const DashboardMetrics = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await dashboardApi.stats();
      setData(stats);
    } catch (err) {
      console.error("dashboard stats failed", err);
      setError("İstatistikler yüklenemedi.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Sadece SuperAdmin gerçek verileri görebilir, diğer rollerde tüm değerler 0 gösterilir
  const isSuperAdmin = user?.role === "SuperAdmin";
  const safeData: DashboardStats | null = data
    ? isSuperAdmin
      ? data
      : {
          totalBookings: 0,
          totalBookingsThisMonth: 0,
          totalRevenue: 0,
          totalRevenueThisMonth: 0,
          totalCustomers: 0,
          totalCustomersThisMonth: 0,
          activeUsers: 0,
          bookingsChangePercent: 0,
          revenueChangePercent: 0,
          customersChangePercent: 0,
          activeUsersChangePercent: 0,
        }
    : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        {CARDS.map((c) => (
          <div key={c.key} className={cardWrapperCls}>
            <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            <div className="mt-5 space-y-3">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-7 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !safeData) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
        <div className="flex items-center justify-between gap-4">
          <span>{error ?? "İstatistikler yüklenemedi."}</span>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {CARDS.map((c) => {
        const value = safeData[c.key];
        const change = safeData[c.changeKey];
        return (
          <div key={c.key} className={cardWrapperCls}>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl ${c.iconBg}`}
            >
              {c.icon}
            </div>
            <div className="flex items-end justify-between mt-5">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {c.label}
                </span>
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                  {c.format(value)}
                </h4>
              </div>
              <ChangeBadge value={change} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
