import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LuCompass,
  LuHouse,
  LuScissors,
  LuSparkles,
} from "react-icons/lu";

export const metadata: Metadata = {
  title: "Page Not Found (404) | SalonBook",
  description: "The page you're looking for doesn't exist or may have been moved.",
};

export default function GlobalNotFound() {
  return (
    <div className="relative min-h-[calc(100vh-12rem)] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-brand-light/20">
      {/* Background Ambient Decorative Glows */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-140 h-70 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-4 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-xl text-center">
        <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-8 sm:p-12 shadow-xl shadow-stone-900/5 space-y-7">
          {/* Badge & Floating Icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-light text-brand-primary ring-8 ring-brand-light/60 shadow-inner">
            <LuCompass className="h-10 w-10 animate-[spin_12s_linear_infinite]" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-stone-900 shadow-xs">
              <LuSparkles className="h-3.5 w-3.5" />
            </span>
          </div>

          {/* Heading & Information */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-light/70 px-3.5 py-1 text-xs font-semibold text-brand-primary uppercase tracking-widest">
              <span>Error 404</span>
              <span>•</span>
              <span>Page Not Found</span>
            </div>

            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900">
              Lost in Style?
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
            >
              <LuHouse className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-light px-6 py-2.5 text-xs sm:text-sm font-semibold text-brand-primary hover:bg-brand-light/80 transition cursor-pointer"
            >
              <LuScissors className="h-4 w-4" />
              <span>Browse Services</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
