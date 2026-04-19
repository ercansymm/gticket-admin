"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "@/icons";

type Metric = {
  label: string;
  value: string;
  trend: { direction: "up" | "down"; value: string; tone: "success" | "error" | "warning" };
  icon: React.ReactNode;
  iconBg: string;
};

const metrics: Metric[] = [
  {
    label: "Bugünkü Rezervasyonlar",
    value: "127",
    trend: { direction: "up", value: "12.4%", tone: "success" },
    icon: <BoxIconLine className="text-emerald-600 dark:text-emerald-400" />,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    label: "Bekleyen Ödemeler",
    value: "23",
    trend: { direction: "up", value: "4.2%", tone: "warning" },
    icon: <GroupIcon className="text-amber-600 size-6 dark:text-amber-400" />,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    label: "BiletBank Hataları (24s)",
    value: "8",
    trend: { direction: "down", value: "21.3%", tone: "success" },
    icon: <BoxIconLine className="text-rose-600 dark:text-rose-400" />,
    iconBg: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    label: "Aktif Oturumlar",
    value: "342",
    trend: { direction: "up", value: "8.7%", tone: "success" },
    icon: <GroupIcon className="text-sky-600 size-6 dark:text-sky-400" />,
    iconBg: "bg-sky-50 dark:bg-sky-500/10",
  },
];

export const DashboardMetrics = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${m.iconBg}`}>
            {m.icon}
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {m.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {m.value}
              </h4>
            </div>
            <Badge color={m.trend.tone}>
              {m.trend.direction === "up" ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon className="text-error-500" />
              )}
              {m.trend.value}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};