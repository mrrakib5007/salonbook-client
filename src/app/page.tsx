import React, { Suspense } from "react";
import BannerSection from "@/components/Home/BannerSection";
import FeaturedServices from "@/components/Home/FeaturedServices";
import CategorySection from "@/components/Home/CategorySection";
import HowItWorksSection from "@/components/Home/HowItWorksSection";

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

function CategorySectionSkeleton() {
  return (
    <section className="relative w-full py-16 sm:py-20 bg-brand-light/35 border-y border-brand-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-pulse">
          <div className="h-10 w-72 bg-stone-200/70 rounded-full mx-auto mb-3" />
          <div className="h-4 w-96 max-w-full bg-stone-200/60 rounded-full mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-7 text-center shadow-xs animate-pulse"
            >
              <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-stone-200/70 mb-4" />
              <div className="h-4 w-28 bg-stone-200/70 rounded mb-2" />
              <div className="h-3 w-36 bg-stone-200/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <BannerSection />
      <Suspense fallback={<FeaturedServicesSkeleton />}>
        <FeaturedServices />
      </Suspense>
      <Suspense fallback={<CategorySectionSkeleton />}>
        <CategorySection />
      </Suspense>
      <HowItWorksSection />
    </div>
  );
}
