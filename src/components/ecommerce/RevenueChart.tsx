"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApexOptions } from "apexcharts";
import { dashboardApi } from "@/lib/dashboard";
import type { DashboardRevenuePoint } from "@/types/admin";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const TR_MONTHS_SHORT = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

function formatMonthLabel(iso: string): string {
  // iso = "YYYY-MM"
  const parts = iso.split("-");
  if (parts.length !== 2) return iso;
  const monthIdx = Number(parts[1]) - 1;
  if (monthIdx < 0 || monthIdx > 11) return iso;
  return TR_MONTHS_SHORT[monthIdx];
}

const formatTRY = (val: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(val);

const MONTHS = 6;

export default function RevenueChart() {
  const [data, setData] = useState<DashboardRevenuePoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const points = await dashboardApi.revenue(MONTHS);
      setData(points);
    } catch (err) {
      console.error("dashboard revenue failed", err);
      setError("Gelir grafiği yüklenemedi.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { categories, revenueSeries, bookingCounts, total, average } = useMemo(() => {
    const points = data ?? [];
    const cats = points.map((p) => formatMonthLabel(p.month));
    const revs = points.map((p) => p.revenue);
    const bookings = points.map((p) => p.bookings);
    const sum = revs.reduce((a, b) => a + b, 0);
    const avg = revs.length > 0 ? Math.round(sum / revs.length) : 0;
    return {
      categories: cats,
      revenueSeries: revs,
      bookingCounts: bookings,
      total: sum,
      average: avg,
    };
  }, [data]);

  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
        const rev = revenueSeries[dataPointIndex] ?? 0;
        const bookings = bookingCounts[dataPointIndex] ?? 0;
        const label = categories[dataPointIndex] ?? "";
        return `
          <div style="padding:8px 12px;font-size:12px">
            <div style="font-weight:600;margin-bottom:4px">${label}</div>
            <div>Gelir: <b>${formatTRY(rev)}</b></div>
            <div>Rezervasyon: <b>${bookings}</b></div>
          </div>
        `;
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => {
          if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
          return val.toString();
        },
      },
    },
  };

  const series = [{ name: "Gelir", data: revenueSeries }];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gelir
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Son {MONTHS} ayın gelir trendi
          </p>
        </div>
        <div className="flex gap-6 sm:justify-end">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Toplam
            </span>
            <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
              {formatTRY(total)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Aylık Ortalama
            </span>
            <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
              {formatTRY(average)}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[310px] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
      ) : error || !data ? (
        <div className="flex h-[310px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <span>{error ?? "Gelir grafiği yüklenemedi."}</span>
          <button
            type="button"
            onClick={load}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-500/40 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Tekrar dene
          </button>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[600px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
