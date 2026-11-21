"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuCheck,
  LuClock,
  LuCopy,
  LuCreditCard,
  LuSearch,
  LuUser,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

interface TransactionItem {
  _id: string;
  appointmentId: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerImage?: string | null;
  serviceId?: string;
  serviceName?: string;
  serviceImage?: string;
  category?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

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
    const load = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
        const res = await fetch(`${serverUrl}/api/admin/transactions${query}`, {
          credentials: "include",
          headers: authHeaders,
        });
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setTransactions(data.transactions || []);
        }
      } catch {
        // ignore
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, serverUrl]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Stripe reference copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTimeParts = (isoString?: string) => {
    if (!isoString) return { date: "N/A", time: "" };
    const dateObj = new Date(isoString);
    const date = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Payment Transactions
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Monitor customer payments, Stripe checkout receipts, and verified revenue history.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, email, service, or Stripe reference..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/15 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer text-xs"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-stone-500 text-right shrink-0">
          Showing <strong>{transactions.length}</strong> records
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-2xl bg-stone-200/70"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 mb-3">
            <LuCreditCard className="h-7 w-7" />
          </div>
          <h3 className="font-fraunces text-lg font-bold text-stone-900">
            No Transactions Found
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {search
              ? "No payment records match your search criteria. Try a different query."
              : "No payments have been processed yet. When customers pay for confirmed appointments via Stripe, records will appear here."}
          </p>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && transactions.length > 0 && (
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3 max-w-36">Service Details</th>
                  <th className="px-3 py-3">Schedule</th>
                  <th className="px-3 py-3">Amount</th>
                  <th className="px-3 py-3">Stripe Ref</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-stone-50/80 transition">
                    {/* Customer */}
                    <td className="px-3 py-2.5 max-w-44">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {tx.customerImage ? (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-stone-200">
                            <Image
                              src={tx.customerImage}
                              alt={tx.customerName || "Customer"}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary font-semibold text-xs border border-brand-primary/10">
                            {tx.customerName ? tx.customerName.charAt(0).toUpperCase() : <LuUser className="h-4 w-4" />}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 truncate">
                          <p className="font-semibold text-stone-900 leading-snug truncate" title={tx.customerName}>
                            {tx.customerName || "Customer"}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate" title={tx.customerEmail}>
                            {tx.customerEmail || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service Details (Compact Width) */}
                    <td className="px-3 py-2.5 max-w-36">
                      <p className="font-medium text-stone-900 truncate" title={tx.serviceName}>
                        {tx.serviceName}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate" title={tx.category}>
                        {tx.category || "General"}
                      </p>
                    </td>

                    {/* Appointment Schedule */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <LuCalendar className="h-3.5 w-3.5 text-stone-400" />
                          <span>{tx.appointmentDate || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                          <LuClock className="h-3.5 w-3.5 text-stone-400" />
                          <span>{tx.appointmentTime || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-fraunces font-bold text-sm text-emerald-700">
                        ${tx.amount.toFixed(2)}
                      </span>
                      <span className="ml-1 text-[11px] text-stone-500 uppercase">
                        {tx.currency}
                      </span>
                    </td>

                    {/* Stripe Reference (Compact Width) */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-stone-600 bg-stone-100 rounded-lg px-2 py-0.5 max-w-28 truncate">
                        <span className="truncate">{tx.stripeSessionId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.stripeSessionId, tx._id)}
                          className="shrink-0 text-stone-400 hover:text-stone-700 cursor-pointer"
                          title="Copy Full ID"
                        >
                          {copiedId === tx._id ? (
                            <LuCheck className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <LuCopy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Paid</span>
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {(() => {
                        const { date, time } = formatDateTimeParts(tx.createdAt);
                        return (
                          <div className="space-y-0.5">
                            <p className="text-stone-800 font-medium text-xs">{date}</p>
                            {time && <p className="text-stone-400 text-[11px]">{time}</p>}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && transactions.length > 0 && (
        <div className="space-y-3.5 lg:hidden">
          {transactions.map((tx) => (
            <div
              key={tx._id}
              className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3"
            >
              {/* Header: Customer and Amount */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {tx.customerImage ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-stone-200">
                      <Image
                        src={tx.customerImage}
                        alt={tx.customerName || "Customer"}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary font-semibold text-xs border border-brand-primary/10">
                      {tx.customerName ? tx.customerName.charAt(0).toUpperCase() : <LuUser className="h-4 w-4" />}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm leading-snug">
                      {tx.customerName || "Customer"}
                    </h4>
                    <p className="text-xs text-stone-500">{tx.customerEmail}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-fraunces font-bold text-base text-emerald-700">
                    ${tx.amount.toFixed(2)}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    Paid
                  </span>
                </div>
              </div>

              {/* Service & Schedule */}
              <div className="rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-stone-900">{tx.serviceName}</span>
                  <span className="text-[11px] text-stone-500">{tx.category}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-500 text-[11px] pt-1 border-t border-stone-200/60">
                  <span className="flex items-center gap-1">
                    <LuCalendar className="h-3 w-3" />
                    <span>{tx.appointmentDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <LuClock className="h-3 w-3" />
                    <span>{tx.appointmentTime}</span>
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>Transaction Date:</span>
                <span className="font-medium text-stone-700">{formatDate(tx.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
