"use client";

interface ProductGridSkeletonProps {
  count?: number;
}

export default function ProductGridSkeleton({
  count = 8,
}: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[1.7rem] border border-[#dddddd] bg-white shadow-[0_20px_50px_-40px_rgba(0,0,0,0.16)]"
        >
          <div className="aspect-[4/5] animate-pulse bg-[#eeeeee]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#e5e5e5]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[#e5e5e5]" />
            <div className="h-10 w-full animate-pulse rounded-full bg-[#dcdcdc]" />
          </div>
        </div>
      ))}
    </div>
  );
}
