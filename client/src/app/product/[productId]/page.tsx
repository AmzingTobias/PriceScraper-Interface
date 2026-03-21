"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import {
  fetchProductDetails,
  fetchProductImage,
  fetchProductPrices,
  isNotifiedForProduct,
  enableProductNotification,
  disableProductNotification,
  formatDateFromEpoch,
} from "@/lib/api";
import { tPriceEntry } from "@/lib/types";
import PriceChart, { TimePeriod, periodHasData, getLowestInPeriod } from "@/components/product/price-chart";
import PageShell from "@/components/ui/page-shell";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import Btn from "@/components/ui/btn";
import { Pencil, Bell, BellOff, ExternalLink, TrendingDown } from "lucide-react";

const TIME_PERIODS: { key: TimePeriod; label: string }[] = [
  { key: "1w", label: "1W" },
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "6m", label: "6M" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "All" },
];

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { isLoggedIn, isAdmin, token, mounted } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [prices, setPrices] = useState<tPriceEntry[]>([]);
  const [notified, setNotified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod | null>(null);

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    Promise.all([
      fetchProductDetails(productId).then((d) => {
        setName(d.Name);
        setDescription(d.Description);
      }),
      fetchProductImage(productId).then((img) => {
        setImage(img ? `/uploads/${img.Link}` : null);
      }),
      fetchProductPrices(productId).then((p) => {
        setPrices(p);
        // Default to 1Y if enough data, otherwise all
        setPeriod(periodHasData(p, "1y") ? "1y" : "all");
      }),
    ])
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [productId, router]);

  useEffect(() => {
    if (productId && isLoggedIn) {
      isNotifiedForProduct(productId).then(setNotified);
    }
  }, [productId, isLoggedIn, token]);

  if (loading || period === null) {
    return <ProductDetailSkeleton />;
  }

  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : null;
  const lowestPrice = getLowestInPeriod(prices, period);

  const toggleNotify = async () => {
    if (!productId) return;
    if (notified) {
      const ok = await disableProductNotification(Number(productId));
      if (ok) setNotified(false);
    } else {
      const ok = await enableProductNotification(Number(productId));
      if (ok) setNotified(true);
    }
  };

  return (
    <PageShell bare>
      {/* Main card */}
      <div className="bg-surface-800 border border-white/[0.04] rounded-2xl p-5 md:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image */}
          <div className="shrink-0 mx-auto lg:mx-0">
            <div className="w-[220px] h-[310px] rounded-xl overflow-hidden bg-surface-700 shadow-lg relative">
              {image ? (
                <Image
                  src={image}
                  alt={`${name} cover art`}
                  fill
                  className="object-cover"
                  sizes="220px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted font-display text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight">
                  {name}
                </h1>
                {mounted && isLoggedIn && notified && (
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    <Bell size={12} />
                    Tracking
                  </span>
                )}
              </div>
              {mounted && isAdmin && (
                <button
                  onClick={() => router.push(`/admin/products/${productId}`)}
                  className="p-2 rounded-lg hover:bg-surface-600 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Edit product"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            <div className="h-px bg-white/[0.06] my-5" />

            {description && (
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {description}
              </p>
            )}

            {latestPrice && (
              <div className="space-y-2 mb-6">
                <p className="text-2xl font-bold">
                  <span className="text-text-muted text-sm font-normal mr-2">Current</span>
                  £{latestPrice.Price.toFixed(2)}
                </p>
                {lowestPrice && (
                  <p className="flex items-center gap-1.5 text-sm text-accent">
                    <TrendingDown size={14} />
                    Lowest{period !== "all" ? ` (${TIME_PERIODS.find((p) => p.key === period)?.label})` : ""}:
                    £{lowestPrice.Price.toFixed(2)}
                    <span className="text-text-muted ml-1">
                      on {formatDateFromEpoch(lowestPrice.Date)}
                    </span>
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {latestPrice && (
                <Btn onClick={() => window.open(latestPrice.Site_link, "_blank", "noopener,noreferrer")}>
                  <span className="flex items-center gap-2">
                    <ExternalLink size={14} />
                    Go to Site
                  </span>
                </Btn>
              )}

              {mounted && isLoggedIn && (
                <Btn
                  variant={notified ? "danger" : "primary"}
                  onClick={toggleNotify}
                >
                  <span className="flex items-center gap-2">
                    {notified ? <BellOff size={14} /> : <Bell size={14} />}
                    {notified ? "Stop Notifications" : "Notify Me"}
                  </span>
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price history chart */}
      {prices.length > 1 && (
        <div className="bg-surface-800 border border-white/[0.04] rounded-2xl p-5 md:p-8 mt-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h2 className="font-display text-xl font-bold">Price History</h2>
            <div className="flex gap-1 bg-surface-900 rounded-lg p-1" role="tablist" aria-label="Time period filter">
              {TIME_PERIODS.map(({ key, label }) => {
                const hasData = periodHasData(prices, key);
                return (
                  <button
                    key={key}
                    onClick={() => hasData && setPeriod(key)}
                    disabled={!hasData}
                    role="tab"
                    aria-selected={period === key}
                    aria-label={`Show ${label} price history`}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      period === key
                        ? "bg-accent text-surface-900"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-full h-56 sm:h-72 lg:h-96">
            <PriceChart prices={prices} period={period} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
