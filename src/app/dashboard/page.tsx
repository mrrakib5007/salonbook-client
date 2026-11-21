"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuLayers,
  LuPlus,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

interface CustomerStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

export default function CustomerDashboardOverview() {

  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

      let sessionToken: string | undefined;
      try {
        const sessionData = await authClient.getSession();
        if ((sessionData?.data?.user as { role?: string } | undefined)?.role === "admin") {
          return;
        }
        sessionToken = (sessionData?.data?.session as { token?: string } | undefined)?.token;
      } catch {
        // ignore
      }

      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
        headers["x-session-token"] = sessionToken;
      }

      const res = await fetch(`${serverUrl}/api/customer/stats`, {
        credentials: "include",
        headers,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load dashboard statistics");
      }

      setStats(data.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard stats."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialStats = async () => {
      try {
        const serverUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

        let sessionToken: string | undefined;
        try {
          const sessionData = await authClient.getSession();
          if ((sessionData?.data?.user as { role?: string } | undefined)?.role === "admin") {
            return;
          }
          sessionToken = (sessionData?.data?.session as { token?: string } | undefined)?.token;
        } catch {
          // ignore
        }

        const headers: Record<string, string> = {};
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
          headers["x-session-token"] = sessionToken;
        }

        const res = await fetch(`${serverUrl}/api/customer/stats`, {
          credentials: "include",
          headers,
        });
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setStats(data.stats);
        } else if (!ignore && (!res.ok || !data.success)) {
          setError(data.message || "Failed to load dashboard statistics");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard stats."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialStats();

    return () => {
      ignore = true;
    };
  }, []);

  const statCards = [
    {
      title: "Total Appointment Requests",
      count: stats.total,
      icon: LuLayers,
      color: "brand",
      bgClass: "bg-brand-primary/10 text-brand-primary ring-brand-primary/20",
      borderClass: "border-stone-200/90 hover:border-brand-primary/40",
    },
    {
      title: "Pending Appointments",
      count: stats.pending,
      icon: LuClock,
      color: "amber",
      bgClass: "bg-amber-100 text-amber-700 ring-amber-200",
      borderClass: "border-stone-200/90 hover:border-amber-300",
    },
    {
      title: "Confirmed Appointments",
      count: stats.confirmed,
      icon: LuCircleCheck,
      color: "emerald",
      bgClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      borderClass: "border-stone-200/90 hover:border-emerald-300",
    },
    {
      title: "Cancelled Appointments",
      count: stats.cancelled,
      icon: LuCircleX,
      color: "rose",
      bgClass: "bg-rose-100 text-rose-700 ring-rose-200",
      borderClass: "border-stone-200/90 hover:border-rose-300",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Overview
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time status of your appointment requests and salon bookings
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-primary/90"
          >
            <LuPlus className="h-3.5 w-3.5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchStats}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <section aria-labelledby="overview-stats-heading">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.borderClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 min-w-0 flex-1 leading-snug">
                    {card.title}
                  </span>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-4 ${card.bgClass}`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </div>
                </div>

                <div className="mt-4">
                  {loading ? (
                    <div className="h-9 w-16 animate-pulse rounded-lg bg-stone-200" />
                  ) : (
                    <p className="font-fraunces text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                      {card.count}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
