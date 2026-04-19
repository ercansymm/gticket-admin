"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Son 7 günün label'larını üret (bugün dahil, sağda bugün)
const getLast7Days = (): string[] => {
  const days = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const result: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(days[d.getDay()]);
  }
  return result;
};

// Sahte data — günlük gelir (TL)
const revenueData = [68500, 82300, 74100, 95400, 118200, 103700, 127800];

export default function RevenueChart() {
  const categories = getLast7Days();

  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#10B981"], // emerald-500 (petrol navy + emerald markanla uyumlu)
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
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
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
            maximumFractionDigits: 0,
          }).format(val),
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
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => {
          if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
          return val.toString();
        },
      },
    },
  };

  const series = [
    {
      name: "Gelir",
      data: revenueData,
    },
  ];

  // Toplam ve ortalama
  const total = revenueData.reduce((a, b) => a + b, 0);
  const average = Math.round(total / revenueData.length);
  const formatTRY = (val: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Gelir
          </h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            Son 7 günün gelir trendi
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
              Günlük Ortalama
            </span>
            <p className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
              {formatTRY(average)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[600px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}