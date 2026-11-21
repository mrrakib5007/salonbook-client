"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LuCalendar,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuCreditCard,
  LuScissors,
  LuUsers,
} from "react-icons/lu";
import { authClient, useSession } from "@/lib/auth-client";

interface AdminStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: number;
}

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function AdminOverviewPage() {
  const { data: session } = useSession();
  const mounted = useMounted();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Helper to get auth headers for cross-domain API calls
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const sessionData = await authClient.getSession();
      const token = (
        sessionData?.data?.session as { token?: string } | undefined
      )?.token;
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
          "x-session-token": token,
        };
      }
    } catch {
      // ignore
    }
    return {};
  };

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${serverUrl}/api/admin/stats`, {
          credentials: "include",
          headers: authHeaders,
        });

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("Access restricted: Administrator privileges required.");
          }
          throw new Error("Failed to load admin overview metrics.");
        }

        const data = await res.json();
        if (ignore) return;

        if (data.success && data.stats) {
          setStats(data.stats);
          setError(null);
        } else {
          throw new Error(data.message || "Failed to load admin overview data.");
        }
      } catch (err: unknown) {
        if (ignore) return;
        const msg =
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading dashboard metrics.";
        setError(msg);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      ignore = true;
    };
  }, [serverUrl, retryTrigger]);

  const adminName = mounted && session?.user?.name ? session.user.name : "Administrator";

  return (
    <div suppressHydrationWarning className="space-y-8 pb-12">
      {/* Overview Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-stone-900 tracking-tight">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Welcome back,{" "}
            <strong suppressHydrationWarning className="text-stone-800">
              {adminName}
            </strong>
            . Real-time overview of salon services.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin-dashboard/manage-services"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 transition cursor-pointer"
          >
            <LuScissors className="h-4 w-4" />
            <span>Manage Services</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-rose-800">
          <div className="flex items-start gap-3">
            <LuCircleAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold">Failed to fetch admin stats</h3>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setRetryTrigger((prev) => prev + 1);
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-primary/90"
              >
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton for Stat Cards */}
      {loading && !stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-stone-200 rounded-md" />
                <div className="h-10 w-10 bg-stone-100 rounded-2xl" />
              </div>
              <div className="h-8 w-16 bg-stone-200 rounded-md" />
              <div className="h-3 w-36 bg-stone-100 rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* 6 Required Stat Cards as specified in requirements.txt */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Total Registered Customers */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Registered Customers
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
                <LuUsers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {stats.totalCustomers}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                Total client profiles created
              </p>
            </div>
          </div>

          {/* 2. Total Active Services */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Active Services
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light text-brand-primary group-hover:scale-105 transition-transform">
                <LuScissors className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {stats.totalActiveServices}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                Visible on public salon catalog
              </p>
            </div>
          </div>

          {/* 3. Total Appointment Requests */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Appointment Requests
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
                <LuCalendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                {stats.totalAppointments}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                All-time customer requests
              </p>
            </div>
          </div>

          {/* 4. Pending Appointments */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Pending Appointments
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                <LuClock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-amber-600 tracking-tight">
                {stats.pendingAppointments}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                Awaiting administrator review
              </p>
            </div>
          </div>

          {/* 5. Confirmed Appointments */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Confirmed Appointments
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
                <LuCircleCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-emerald-600 tracking-tight">
                {stats.confirmedAppointments}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                Approved and scheduled visits
              </p>
            </div>
          </div>

          {/* 6. Total Successful Payments */}
          <div className="group relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-stone-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Successful Payments
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 group-hover:scale-105 transition-transform">
                <LuCreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="font-fraunces text-3xl sm:text-4xl font-bold text-teal-700 tracking-tight">
                {stats.totalSuccessfulPayments}
              </span>
              <p className="mt-1 text-xs text-stone-400">
                Verified paid transactions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
