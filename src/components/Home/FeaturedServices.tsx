import React from "react";
import Link from "next/link";
import { LuArrowRight, LuScissors } from "react-icons/lu";
import ServiceCard, { Service } from "@/components/Card/ServiceCard";

async function getFeaturedServices(): Promise<Service[]> {
  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL;
    const res = await fetch(`${serverUrl}/api/services?limit=6`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data?.data || [];
  } catch {
    return [];
  }
}

const FeaturedServices = async () => {
  // Fetch live active services from backend API
  const liveServices = await getFeaturedServices();
  const servicesToDisplay = liveServices.slice(0, 6);

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900">
            Featured Salon Services
          </h2>

          <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-stone-600">
            Discover our clients&apos; most-loved beauty and wellness treatments,
            handcrafted by certified stylists to give you a revitalized, radiant
            look.
          </p>
        </div>

        {/* If no services returned or API is unavailable, show empty state */}
        {servicesToDisplay.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-primary/20 bg-white/70 px-6 py-16 text-center shadow-xs">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light text-brand-primary shadow-xs">
              <LuScissors className="text-3xl" />
            </span>
            <h3 className="mt-4 font-fraunces text-xl font-semibold text-stone-900">
              No Services Available
            </h3>
            <p className="mt-2 max-w-md text-sm text-stone-500 leading-relaxed">
              We couldn&apos;t load the featured salon services right now. Please
              check back shortly or explore our full catalog.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-light px-6 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              <span>Browse All Services</span>
              <LuArrowRight className="text-base" />
            </Link>
          </div>
        ) : (
          <>
            {/* 6 Services Responsive Grid mapped through reusable ServiceCard */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {servicesToDisplay.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>

            {/* More / Explore All Services Button */}
            <div className="mt-8 text-center sm:mt-10">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-primary px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-md shadow-brand-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-lg focus:outline-none"
              >
                <span>Explore All Services</span>
                <LuArrowRight className="text-base" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedServices;
