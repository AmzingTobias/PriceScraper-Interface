"use client";

import { useEffect, useState } from "react";
import { TProductCard } from "@/lib/types";
import ProductCard from "./product-card";

interface ProductGridProps {
  products: TProductCard[];
  notifiedIds?: Set<number>;
  showBadges?: boolean;
}

export default function ProductGrid({ products, notifiedIds, showBadges }: ProductGridProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Mark animation as done after the entrance completes
    const timer = setTimeout(() => setHasAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {products.map((product, i) => (
        <div
          key={product.id}
          className={hasAnimated ? "" : "animate-slide-up opacity-0"}
          style={
            hasAnimated
              ? undefined
              : { animationDelay: `${Math.min(i * 40, 400)}ms`, animationFillMode: "forwards" }
          }
        >
          <ProductCard
            product={product}
            isTracked={showBadges ? notifiedIds?.has(product.id) ?? false : false}
            priority={i < 6}
          />
        </div>
      ))}
    </div>
  );
}
