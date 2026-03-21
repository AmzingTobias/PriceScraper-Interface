"use client";

import { TProductCard } from "@/lib/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell } from "lucide-react";

interface ProductCardProps {
  product: TProductCard;
  isTracked?: boolean;
  priority?: boolean;
}

export default function ProductCard({ product, isTracked, priority }: ProductCardProps) {
  const router = useRouter();
  const go = () => router.push(`/product/${product.id}`);

  return (
    <div
      className="group cursor-pointer"
      onClick={go}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go(); }}
      tabIndex={0}
      role="link"
      aria-label={`View ${product.name}${isTracked ? " (tracking)" : ""}`}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface-700 shadow-card">
        {product.image_link ? (
          <Image
            src={product.image_link}
            alt={`${product.name} cover art`}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted text-xs font-display">
            No Image
          </div>
        )}

        {isTracked && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-accent/90 flex items-center justify-center shadow-lg" aria-label="Tracking this game">
            <Bell size={13} className="text-surface-900" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>
    </div>
  );
}
