import React from "react";

interface ServicesSkeletonProps {
  count?: number;
}

export const ServiceCardSkeleton = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-stone-200/70 bg-white p-5 shadow-2xs animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-stone-200/70">
        <div className="absolute top-3.5 left-3.5 h-6 w-20 rounded-full bg-white/70" />
      </div>

      {/* Body Skeleton */}
      <div className="flex flex-1 flex-col pt-5">
        {/* Title */}
        <div className="h-6 w-3/4 rounded-full bg-stone-200/80" />

        {/* Description (2 lines) */}
        <div className="mt-3 space-y-2">
          <div className="h-3.5 w-full rounded-full bg-stone-200/50" />
          <div className="h-3.5 w-4/5 rounded-full bg-stone-200/50" />
        </div>

        {/* Price & Duration */}
        <div className="mt-6 pt-4 flex items-center justify-between border-t border-stone-100">
          <div className="h-5 w-16 rounded bg-stone-200/80" />
          <div className="h-6 w-20 rounded-full bg-stone-200/60" />
        </div>

        {/* View Details Button */}
        <div className="mt-4 h-10 w-full rounded-2xl bg-stone-200/70" />
      </div>
    </div>
  );
};

export const ServicesSkeleton: React.FC<ServicesSkeletonProps> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
      {[...Array(count)].map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default ServicesSkeleton;
