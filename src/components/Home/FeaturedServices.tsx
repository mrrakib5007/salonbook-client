import React from "react";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import ServiceCard, { Service } from "@/components/Card/ServiceCard";

// Fallback services in case the backend server is temporarily starting or offline during static builds
const FALLBACK_SERVICES: Service[] = [
  {
    _id: "srv_fallback_1",
    serviceName: "Deluxe Haircut & Blowout Styling",
    category: "Haircut & Styling",
    description:
      "Precision haircut tailored to your facial structure, paired with an invigorating shampoo wash and signature blowout.",
    price: 45,
    duration: 45,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    _id: "srv_fallback_2",
    serviceName: "Radiant Hydrating Facial Treatment",
    category: "Facial & Skincare",
    description:
      "Deep pore ultrasonic cleansing, gentle exfoliation, and custom botanical serum infusion for glowing, refreshed skin.",
    price: 75,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    _id: "srv_fallback_3",
    serviceName: "Balayage & Hair Gloss Treatment",
    category: "Hair Coloring",
    description:
      "Hand-painted sun-kissed highlights with a deeply nourishing gloss glaze that revitalizes shine and dimensional color.",
    price: 130,
    duration: 120,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    _id: "srv_fallback_4",
    serviceName: "Keratin Smooth Deep Hair Therapy",
    category: "Hair Treatment",
    description:
      "Intense protein reconstruction treatment that eliminates frizz, restores damaged cuticles, and boosts silkiness.",
    price: 110,
    duration: 90,
    image:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    _id: "srv_fallback_5",
    serviceName: "Aromatherapy Deep Tissue Body Spa",
    category: "Spa & Massage",
    description:
      "Melt away physical fatigue and muscular tension with therapeutic pressure and organic soothing lavender aromatics.",
    price: 95,
    duration: 75,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    _id: "srv_fallback_6",
    serviceName: "Luxury Gel Manicure & Pedicure",
    category: "Manicure & Pedicure",
    description:
      "Herbal soak, exfoliation scrub, nail shaping, hydrating hand massage, and long-lasting chip-resistant gel polish.",
    price: 55,
    duration: 50,
    image:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
];

async function getFeaturedServices(): Promise<Service[]> {
  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
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

  // Use live database services if available, otherwise use fallback
  const servicesToDisplay =
    liveServices.length > 0 ? liveServices.slice(0, 6) : FALLBACK_SERVICES;

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
            <LuArrowRight className="text-lg transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
