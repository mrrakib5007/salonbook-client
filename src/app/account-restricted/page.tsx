import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LuHouse,
  LuMail,
  LuScissors,
  LuShieldAlert,
} from "react-icons/lu";

export const metadata: Metadata = {
  title: "Account Access Restricted | SalonBook",
  description:
    "Your salon account has been suspended by an administrator. Access to protected features has been restricted.",
};

export default function AccountRestrictedPage() {
  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light/30">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-140 h-70 bg-rose-500/10 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl border border-rose-200/90 bg-white p-7 sm:p-10 shadow-xl shadow-rose-950/5 text-center space-y-6">
          {/* Icon Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <LuShieldAlert className="h-8 w-8" />
          </div>

          {/* Heading and Notice */}
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 tracking-wide uppercase">
              Access Suspended
            </span>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 pt-1">
              Account Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed pt-1">
              Your salon account has been suspended by an administrator. As a result, access to customer dashboard features and appointment booking has been restricted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer"
            >
              <LuHouse className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
            >
              <LuScissors className="h-4 w-4" />
              <span>Browse Services</span>
            </Link>
          </div>

          {/* Support Helpline Footer */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <LuMail className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                <span>Believe this is an error? Contact salon support at</span>
              </span>
              <a
                href="mailto:support@salonbook.com"
                className="font-medium text-stone-700 hover:text-brand-primary underline transition"
              >
                support@salonbook.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
