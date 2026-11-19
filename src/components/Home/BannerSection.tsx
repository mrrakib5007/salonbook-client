import React from "react";
import Image from "next/image";
import Link from "next/link";
import { LuSparkles, LuStar } from "react-icons/lu";

const BannerSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-[#1e0a14]">
      {/* Salon-Themed Background Image with Next.js Optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner-bg.jpg"
          alt="Luxury Salon and Spa Interior"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Multi-layer Gradient Overlay for Text Readability & Brand Aesthetics */}
        <div className="absolute inset-0 bg-linear-to-r from-[#180710]/95 via-[#180710]/80 to-[#180710]/35" />
        <div className="absolute inset-0 bg-linear-to-t from-[#180710] via-transparent to-transparent opacity-60 sm:opacity-40" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left max-w-2xl lg:max-w-3xl">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-brand-secondary backdrop-blur-md">
            <LuSparkles className="text-sm text-brand-secondary animate-pulse" />
            <span>Premium Salon & Wellness Booking</span>
          </div>

          {/* Title */}
          <h1 className="mt-5 font-fraunces text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
            Elevate Your Style with{" "}
            <span className="text-brand-secondary">Expert Salon Care</span>
          </h1>

          {/* Short Description */}
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-200">
            Step into relaxation and discover master stylists for hair styling,
            rejuvenating facials, and luxury spa treatments. Browse services,
            pick your ideal time slot, and confirm your appointment with ease.
          </p>

          {/* CTA Button & Secondary Info */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 w-full sm:w-auto">
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-brand-primary px-8 py-4 text-base font-semibold text-brand-light shadow-lg shadow-brand-primary/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-xl hover:shadow-brand-primary/50 focus:outline-none"
            >
              <span>Explore Salon Services</span>              
            </Link>

            <div className="flex items-center justify-center gap-3 px-2 py-1 text-xs sm:text-sm text-stone-300">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <LuStar
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="font-medium text-white">4.9/5</span>
              <span className="text-stone-400">• 2,500+ happy clients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
