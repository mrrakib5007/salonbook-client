"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LuCalendar,
  LuCircleCheck,
  LuClock,
  LuCreditCard,
  LuHouse,
  LuLayoutDashboard,
  LuLoader,
  LuScissors,
  LuShieldAlert,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

interface VerifiedTransaction {
  _id?: string;
  appointmentId: string;
  customerName?: string;
  customerEmail?: string;
  serviceName?: string;
  serviceImage?: string;
  category?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: string;
  createdAt?: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<VerifiedTransaction | null>(null);

  const displayError = !sessionId ? "No Stripe session reference found in the URL." : error;

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

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

    if (!sessionId) {
      return;
    }

    const verify = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${serverUrl}/api/customer/verify-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();
        if (!ignore) {
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to verify payment status.");
          }
          setTransaction(data.transaction);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Error verifying payment with Stripe."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      ignore = true;
    };
  }, [sessionId, serverUrl]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 mb-4">
          <LuLoader className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="font-fraunces text-2xl font-bold text-stone-900">
          Verifying Your Payment
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-sm">
          Please wait a moment while we synchronize your transaction receipt with Stripe...
        </p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-7 sm:p-10 shadow-xl shadow-stone-900/5 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
            <LuShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="font-fraunces text-2xl font-bold text-stone-900">
              Payment Verification Issue
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-600">
              {displayError}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/my-appointments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
            >
              <LuCalendar className="h-4 w-4" />
              <span>My Appointments</span>
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
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        {/* Main Receipt Card */}
        <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white p-6 sm:p-10 shadow-xl shadow-stone-900/5 text-center space-y-6">
          {/* Success Check Badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <LuCircleCheck className="h-9 w-9" />
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              Payment Verified
            </span>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 pt-1">
              Payment Successful!
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              Thank you for your payment. Your appointment status has been updated to{" "}
              <strong className="text-emerald-700 font-semibold">Paid</strong>. We look forward to pampering you at SalonBook!
            </p>
          </div>

          {/* Detailed Receipt Box */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 sm:p-6 text-left space-y-4">
            {/* Service Item Header */}
            <div className="flex items-center gap-3.5 pb-3 border-b border-stone-200/80">
              {transaction?.serviceImage ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <Image
                    src={transaction.serviceImage}
                    alt={transaction.serviceName || "Salon Service"}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-primary">
                  <LuScissors className="h-6 w-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-primary">
                  {transaction?.category || "Salon Service"}
                </span>
                <h3 className="font-semibold text-stone-900 text-sm sm:text-base leading-snug truncate">
                  {transaction?.serviceName || "Appointment Service"}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  {transaction?.appointmentDate && (
                    <span className="flex items-center gap-1">
                      <LuCalendar className="h-3 w-3 text-stone-400" />
                      <span>{transaction.appointmentDate}</span>
                    </span>
                  )}
                  {transaction?.appointmentTime && (
                    <span className="flex items-center gap-1">
                      <LuClock className="h-3 w-3 text-stone-400" />
                      <span>{transaction.appointmentTime}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-stone-600">
                <span>Payment Method</span>
                <span className="font-medium text-stone-800 flex items-center gap-1.5">
                  <LuCreditCard className="h-3.5 w-3.5 text-stone-500" />
                  <span>Stripe Checkout (Card)</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Payment Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Paid in Full</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-200/80 text-sm">
                <span className="font-semibold text-stone-900">Total Paid</span>
                <span className="font-fraunces font-bold text-lg text-emerald-700">
                  ${transaction?.amount || 0} {transaction?.currency || "USD"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: View My Appointments & Dashboard Overview */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard/my-appointments"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
            >
              <LuCalendar className="h-4 w-4" />
              <span>View My Appointments</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer"
            >
              <LuLayoutDashboard className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-primary border-t-transparent mb-3" />
          <p className="text-xs sm:text-sm font-medium text-stone-700">Loading receipt...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
