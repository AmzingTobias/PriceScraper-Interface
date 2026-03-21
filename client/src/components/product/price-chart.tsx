"use client";

import {
  Chart,
  registerables,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { tPriceEntry } from "@/lib/types";

Chart.register(...registerables);

export type TimePeriod = "all" | "1y" | "6m" | "3m" | "1m" | "1w";

type DailyLowest = { date: string; price: number; epoch: number };

function getDailyLowest(data: tPriceEntry[]): DailyLowest[] {
  const map: Record<string, { prices: number[]; epoch: number }> = {};
  for (const p of data) {
    const d = new Date(p.Date * 1000);
    const key = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getFullYear()}`;
    if (!map[key]) map[key] = { prices: [], epoch: p.Date };
    map[key].prices.push(p.Price);
  }
  return Object.entries(map).map(([date, { prices, epoch }]) => ({
    date,
    price: Math.min(...prices),
    epoch,
  }));
}

function filterByPeriod(daily: DailyLowest[], period: TimePeriod): DailyLowest[] {
  if (period === "all") return daily;
  const now = Date.now() / 1000;
  const cutoffs: Record<Exclude<TimePeriod, "all">, number> = {
    "1y": now - 365 * 86400,
    "6m": now - 182 * 86400,
    "3m": now - 91 * 86400,
    "1m": now - 30 * 86400,
    "1w": now - 7 * 86400,
  };
  return daily.filter((d) => d.epoch >= cutoffs[period]);
}

interface PriceChartProps {
  prices: tPriceEntry[];
  period: TimePeriod;
}

export default function PriceChart({ prices, period }: PriceChartProps) {
  const allDaily = getDailyLowest(prices);
  const daily = filterByPeriod(allDaily, period);

  const data = {
    labels: daily.map((d) => d.date),
    datasets: [
      {
        stepped: true as const,
        label: "Price",
        data: daily.map((d) => d.price),
        fill: true,
        borderColor: "#a78bfa",
        backgroundColor: "rgba(167, 139, 250, 0.06)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "#a78bfa",
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { color: "#5e5e72", font: { family: "Outfit", size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: {
          color: "#5e5e72",
          font: { family: "Outfit", size: 12 },
          callback: (v: string | number) => `£${v}`,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a26",
        borderColor: "rgba(167,139,250,0.2)",
        borderWidth: 1,
        titleColor: "#e8e8ed",
        bodyColor: "#9898a8",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: { formattedValue: string }) => `£${ctx.formattedValue}`,
        },
      },
    },
    onClick: (_event: unknown, elements: { datasetIndex: number; index: number }[]) => {
      if (elements.length > 0 && daily.length > 0) {
        // Find the original price entry matching the clicked daily-lowest point
        const clickedEpoch = daily[elements[0].index]?.epoch;
        if (clickedEpoch) {
          const match = prices.find((p) => p.Date === clickedEpoch);
          if (match?.Site_link) {
            window.open(match.Site_link, "_blank", "noopener,noreferrer");
          }
        }
      }
    },
  };

  if (daily.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No price data for this time period.
      </div>
    );
  }

  return <Line data={data} options={options} />;
}

// Utility: check if a period has any data
export function periodHasData(prices: tPriceEntry[], period: TimePeriod): boolean {
  if (period === "all") return prices.length > 1;
  const allDaily = getDailyLowest(prices);
  return filterByPeriod(allDaily, period).length > 1;
}

// Utility: get the lowest price within a time period
export function getLowestInPeriod(
  prices: tPriceEntry[],
  period: TimePeriod
): tPriceEntry | null {
  if (prices.length === 0) return null;
  if (period === "all") {
    return prices.reduce((min, cur) => (cur.Price < min.Price ? cur : min));
  }
  const now = Date.now() / 1000;
  const cutoffs: Record<Exclude<TimePeriod, "all">, number> = {
    "1y": now - 365 * 86400,
    "6m": now - 182 * 86400,
    "3m": now - 91 * 86400,
    "1m": now - 30 * 86400,
    "1w": now - 7 * 86400,
  };
  const filtered = prices.filter((p) => p.Date >= cutoffs[period]);
  if (filtered.length === 0) return null;
  return filtered.reduce((min, cur) => (cur.Price < min.Price ? cur : min));
}
