"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchProductCards, getNotifiedProducts } from "@/lib/api";
import { TProductCard, TProductList } from "@/lib/types";
import ProductGrid from "@/components/product/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { Search, Bell, LayoutGrid } from "lucide-react";

export default function HomePage() {
  const { isLoggedIn, mounted, showNotifiedOnly, setShowNotifiedOnly } = useAuth();
  const [products, setProducts] = useState<TProductCard[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<TProductList>([]);
  const [loading, setLoading] = useState(true);
  const [notifiedLoaded, setNotifiedLoaded] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProductCards()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setNotifiedLoaded(false);
      getNotifiedProducts()
        .then(setNotifiedIds)
        .finally(() => setNotifiedLoaded(true));
    } else {
      setNotifiedIds([]);
      setNotifiedLoaded(true);
    }
  }, [isLoggedIn]);

  const waitingForNotified = showNotifiedOnly && isLoggedIn && !notifiedLoaded;

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (showNotifiedOnly && notifiedIds.length > 0) {
      return matchesSearch && notifiedIds.some((n) => n.ProductId === p.id);
    }
    return matchesSearch;
  });

  const notifiedSet = new Set(notifiedIds.map((n) => n.ProductId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 animate-fade-in">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            className="w-full bg-surface-800 border border-white/[0.04] text-text-primary placeholder:text-text-muted rounded-xl pl-11 pr-4 py-3 outline-none focus:border-accent/30 hover:border-accent/15 transition-colors"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {mounted && isLoggedIn && notifiedLoaded && notifiedIds.length > 0 && (
          <button
            onClick={() => setShowNotifiedOnly(!showNotifiedOnly)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
              showNotifiedOnly
                ? "bg-accent/10 border-accent/30 text-accent"
                : "bg-surface-800 border-white/[0.04] text-text-secondary hover:text-text-primary hover:border-accent/15"
            }`}
          >
            {showNotifiedOnly ? <Bell size={16} /> : <LayoutGrid size={16} />}
            {showNotifiedOnly ? "Watching" : "All"}
          </button>
        )}
      </div>

      {/* Product grid */}
      {loading || waitingForNotified ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <p className="text-center text-text-muted py-20 text-lg">
          No games tracked yet.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-text-muted py-20 text-lg">
          No games match your search.
        </p>
      ) : (
        <ProductGrid
          key={showNotifiedOnly ? "watching" : "all"}
          products={filtered}
          notifiedIds={notifiedSet}
          showBadges={mounted && isLoggedIn}
        />
      )}
    </div>
  );
}
