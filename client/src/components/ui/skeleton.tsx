"use client";

export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-surface-700 rounded-xl animate-pulse ${className}`}
    />
  );
}

/** Skeleton for a single product card in the grid */
export function ProductCardSkeleton() {
  return (
    <div>
      <SkeletonBox className="aspect-[2/3] w-full" />
      <div className="mt-2.5 px-0.5 space-y-1.5">
        <SkeletonBox className="h-4 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

/** Skeleton for the full product grid (home page) */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Skeleton for the product detail page */
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
      <div className="bg-surface-800 border border-white/[0.04] rounded-2xl p-5 md:p-8 shadow-card">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image skeleton */}
          <div className="shrink-0 mx-auto lg:mx-0">
            <SkeletonBox className="w-[220px] h-[310px]" />
          </div>
          {/* Details skeleton */}
          <div className="flex-1 space-y-4">
            <SkeletonBox className="h-8 w-2/3 rounded-lg" />
            <SkeletonBox className="h-px w-full rounded-none bg-white/[0.06]" />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full rounded-md" />
              <SkeletonBox className="h-4 w-5/6 rounded-md" />
              <SkeletonBox className="h-4 w-4/6 rounded-md" />
            </div>
            <div className="pt-4 space-y-2">
              <SkeletonBox className="h-7 w-32 rounded-md" />
              <SkeletonBox className="h-5 w-48 rounded-md" />
            </div>
            <div className="flex gap-3 pt-4">
              <SkeletonBox className="h-10 w-32 rounded-full" />
              <SkeletonBox className="h-10 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      {/* Chart skeleton */}
      <div className="bg-surface-800 border border-white/[0.04] rounded-2xl p-5 md:p-8 mt-6 shadow-card">
        <SkeletonBox className="h-6 w-40 rounded-md mb-5" />
        <SkeletonBox className="w-full h-56 sm:h-72 lg:h-96 rounded-lg" />
      </div>
    </div>
  );
}
