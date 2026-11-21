import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LuHouse,
  LuLayoutDashboard,
  LuLock,
} from "react-icons/lu";

export const metadata: Metadata = {
  title: "Unauthorized Access | SalonBook",
  description:
    "You do not have permission to access the Salon Administrator Portal. Administrator privileges required.",
};

export default function UnauthorizedPage() {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light/30">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-140 h-70 bg-amber-500/10 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-amber-200/90 bg-white p-7 sm:p-10 shadow-xl shadow-stone-900/5 text-center space-y-6">
          {/* Icon Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            <LuLock className="h-8 w-8" />
          </div>

          {/* Heading and Notice */}
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 tracking-wide uppercase">
              403 • Access Denied
            </span>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 pt-1">
              Unauthorized Access
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed pt-1">
              You do not have administrative privileges to access the salon management portal. This area is strictly reserved for authorized administrators and salon managers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
            >
              <LuLayoutDashboard className="h-4 w-4" />
              <span>Customer Dashboard</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer"
            >
              <LuHouse className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
