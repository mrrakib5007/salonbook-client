import React, { Suspense } from "react";
import BannerSection from "@/components/Home/BannerSection";
import FeaturedServices from "@/components/Home/FeaturedServices";
import CategorySection from "@/components/Home/CategorySection";

function FeaturedServicesSkeleton() {
  return (
    <div className="py-16 sm:py-20 lg:py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md h-8 bg-stone-200/60 rounded-full animate-pulse mb-12" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-3xl bg-white border border-stone-200/60 p-5 animate-pulse"
          >
            <div className="aspect-16/10 w-full rounded-2xl bg-stone-200/60 mb-4" />
            <div className="h-4 w-24 bg-stone-200/60 rounded mb-3" />
            <div className="h-6 w-3/4 bg-stone-200/60 rounded mb-2" />
            <div className="h-4 w-full bg-stone-200/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div>
      <BannerSection />
      <Suspense fallback={<FeaturedServicesSkeleton />}>
        <FeaturedServices />
      </Suspense>
      <CategorySection />
    </div>
  );
}
