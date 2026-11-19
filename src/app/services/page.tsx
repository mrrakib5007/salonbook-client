import React, { Suspense } from "react";
import type { Metadata } from "next";
import ServicesContent from "@/components/Services/ServicesContent";
import ServicesSkeleton from "@/components/Services/ServicesSkeleton";

export const metadata: Metadata = {
  title: "Browse Services | SalonBook",
  description:
    "Explore our complete catalog of salon and beauty services. Filter by category, search by service name, and book appointments online with ease.",
};

function ServicesPageLoading() {
  return (
    <div className="w-full">
      <div className="border-b border-brand-primary/10 bg-brand-light/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-6 w-36 rounded-full bg-stone-200/80 mb-4" />
          <div className="h-10 w-72 rounded-full bg-stone-200/80 mb-3" />
          <div className="h-4 w-96 max-w-full rounded-full bg-stone-200/60" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <ServicesSkeleton count={6} />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-stone-50/40">
      <Suspense fallback={<ServicesPageLoading />}>
        <ServicesContent />
      </Suspense>
    </main>
  );
}
