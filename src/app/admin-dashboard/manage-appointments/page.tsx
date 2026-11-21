"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuCreditCard,
  LuEye,
  LuImage,
  LuMessageSquare,
  LuRefreshCw,
  LuRotateCcw,
  LuSearch,
  LuTriangleAlert,
  LuUser,
  LuX,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

export interface Appointment {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerImage?: string;
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  category?: string;
  price: number;
  duration?: number;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  appointmentStatus: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid";
  createdAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  updatedAt?: string;
}

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "Pending" | "Confirmed" | "Cancelled">("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<"all" | "Paid" | "Unpaid">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "date_asc" | "date_desc" | "price_desc" | "price_asc">("newest");

  // Modals state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToConfirm, setAppointmentToConfirm] = useState<Appointment | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // In-flight action tracking
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Helper for cross-domain auth headers
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

  // Fetch appointments
  const fetchAppointments = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const authHeaders = await getAuthHeaders();
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedPaymentStatus !== "all") params.append("paymentStatus", selectedPaymentStatus);
        if (sortBy) params.append("sort", sortBy);

        const res = await fetch(
          `${serverUrl}/api/admin/appointments?${params.toString()}`,
          {
            headers: {
              ...authHeaders,
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load appointments");
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        console.error("Error fetching admin appointments:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect to the server. Please verify your internet connection."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [serverUrl, searchTerm, selectedStatus, selectedPaymentStatus, sortBy]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  // Handle Confirm Appointment
  const handleConfirmAppointment = async (appt: Appointment) => {
    if (appt.appointmentStatus !== "Pending") {
      toast.error("Only pending appointments can be confirmed.");
      return;
    }

    try {
      setActionInProgressId(appt._id);
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${serverUrl}/api/admin/appointments/${appt._id}/confirm`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to confirm appointment");
      }

      toast.success("Appointment confirmed successfully!");

      // Update state in-place
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appt._id
            ? { ...item, appointmentStatus: "Confirmed", confirmedAt: new Date().toISOString() }
            : item
        )
      );

      // If details modal is open for this item, update it
      if (selectedAppointment?._id === appt._id) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, appointmentStatus: "Confirmed" } : null
        );
      }

      setAppointmentToConfirm(null);
    } catch (err) {
      console.error("Error confirming appointment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to confirm appointment.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Cancel Appointment
  const handleCancelAppointment = async (appt: Appointment) => {
    if (appt.appointmentStatus === "Cancelled") {
      toast.error("This appointment is already cancelled.");
      return;
    }

    try {
      setActionInProgressId(appt._id);
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${serverUrl}/api/admin/appointments/${appt._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      toast.success("Appointment cancelled. Slot reopened for booking!");

      // Update state in-place
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appt._id
            ? { ...item, appointmentStatus: "Cancelled", cancelledAt: new Date().toISOString() }
            : item
        )
      );

      // If details modal is open for this item, update it
      if (selectedAppointment?._id === appt._id) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, appointmentStatus: "Cancelled" } : null
        );
      }

      setAppointmentToCancel(null);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      toast.error(err instanceof Error ? err.message : "Failed to cancel appointment.");
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Refresh Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-stone-900 tracking-tight">
            Manage Salon Appointments
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review customer bookings, confirm pending requests, and manage salon schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAppointments(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <LuRefreshCw
              className={`h-4 w-4 text-stone-500 ${
                refreshing ? "animate-spin text-brand-primary" : ""
              }`}
            />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && !loading && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <LuCircleAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchAppointments()}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, email, or service..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-8 text-xs sm:text-sm text-stone-900 transition focus:border-brand-primary focus:bg-white focus:outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <LuX className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="sm:w-40">
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value as "all" | "Pending" | "Confirmed" | "Cancelled"
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending Only</option>
            <option value="Confirmed">Confirmed Only</option>
            <option value="Cancelled">Cancelled Only</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="sm:w-36">
          <select
            value={selectedPaymentStatus}
            onChange={(e) =>
              setSelectedPaymentStatus(
                e.target.value as "all" | "Paid" | "Unpaid"
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:w-48">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "newest"
                  | "oldest"
                  | "date_asc"
                  | "date_desc"
                  | "price_desc"
                  | "price_asc"
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="date_asc">Date: Nearest</option>
            <option value="date_desc">Date: Furthest</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Appointments Container */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs">
        {loading && !refreshing ? (
          /* Loading Skeletons */
          <div className="p-4 sm:p-6 space-y-3.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 animate-pulse py-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-stone-200 shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="h-3.5 w-32 sm:w-40 rounded-md bg-stone-200" />
                    <div className="h-2.5 w-24 sm:w-48 rounded-md bg-stone-100" />
                  </div>
                </div>
                <div className="hidden sm:block h-5 w-24 rounded-full bg-stone-100 shrink-0" />
                <div className="h-4 w-16 rounded-md bg-stone-200 shrink-0" />
                <div className="h-7 w-20 rounded-xl bg-stone-100 shrink-0" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-primary mb-3.5">
              <LuCalendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-fraunces">
              No appointments found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all"
                ? "No bookings match your selected filter criteria. Try clearing filters or changing search keywords."
                : "No customer appointment requests have been submitted yet."}
            </p>
            {(searchTerm || selectedStatus !== "all" || selectedPaymentStatus !== "all") && (
              <div className="mt-5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedPaymentStatus("all");
                    setSortBy("newest");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  <LuRotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (Zero horizontal scroll on mobile) */}
            <div className="block md:hidden divide-y divide-stone-100">
              {appointments.map((appt) => {
                const isPending = appt.appointmentStatus === "Pending";
                const isConfirmed = appt.appointmentStatus === "Confirmed";
                const isCancelled = appt.appointmentStatus === "Cancelled";
                const isPaid = appt.paymentStatus === "Paid";
                const isActionLoading = actionInProgressId === appt._id;

                return (
                  <div key={appt._id} className="p-4 transition hover:bg-stone-50/50">
                    <div className="flex items-start justify-between gap-3">
                      {/* Customer Info & Avatar / Image */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {appt.customerImage ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                            <Image
                              src={appt.customerImage}
                              alt={appt.customerName || "Customer"}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-xs font-bold">
                            {appt.customerName ? appt.customerName.charAt(0).toUpperCase() : "C"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-stone-900" title={appt.customerName}>
                            {appt.customerName || "Customer"}
                          </p>
                          <p className="truncate text-[11px] text-stone-500" title={appt.customerEmail}>
                            {appt.customerEmail}
                          </p>
                        </div>
                      </div>

                      {/* Price */}
                      <span className="font-fraunces font-bold text-sm text-stone-900 shrink-0">
                        ${appt.price}
                      </span>
                    </div>

                    {/* Service & Schedule Info */}
                    <div className="mt-2.5 rounded-xl bg-stone-50 p-2.5 border border-stone-100 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-stone-800">
                          {appt.serviceName}
                        </span>
                        {appt.category && (
                          <span className="shrink-0 text-[10px] font-medium text-stone-500">
                            {appt.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-600">
                        <span className="inline-flex items-center gap-1">
                          <LuCalendar className="h-3 w-3 text-stone-400" />
                          {appt.appointmentDate}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <LuClock className="h-3 w-3 text-stone-400" />
                          {appt.appointmentTime}
                        </span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Booking Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isConfirmed
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-stone-100 text-stone-600 border border-stone-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isConfirmed
                                ? "bg-emerald-500"
                                : isPending
                                ? "bg-amber-500 animate-pulse"
                                : "bg-stone-400"
                            }`}
                          />
                          {appt.appointmentStatus}
                        </span>

                        {/* Payment Status Badge */}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {appt.paymentStatus}
                        </span>
                      </div>

                      <span className="text-[10px] text-stone-400">
                        Booked: {new Date(appt.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedAppointment(appt)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                      >
                        <LuEye className="h-3.5 w-3.5 text-stone-500" />
                        <span>Details</span>
                      </button>

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => setAppointmentToConfirm(appt)}
                          disabled={isActionLoading}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setAppointmentToCancel(appt)}
                          disabled={isActionLoading}
                          className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Compact columns to prevent horizontal overflow on PC) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-3.5 py-3 w-48 lg:w-56">Customer</th>
                    <th className="px-3 py-3 w-48 lg:w-56">Service</th>
                    <th className="px-3 py-3 whitespace-nowrap">Schedule</th>
                    <th className="px-2.5 py-3 whitespace-nowrap">Price & Pay</th>
                    <th className="px-2.5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {appointments.map((appt) => {
                    const isPending = appt.appointmentStatus === "Pending";
                    const isConfirmed = appt.appointmentStatus === "Confirmed";
                    const isCancelled = appt.appointmentStatus === "Cancelled";
                    const isPaid = appt.paymentStatus === "Paid";
                    const isActionLoading = actionInProgressId === appt._id;

                    return (
                      <tr key={appt._id} className="transition hover:bg-stone-50/60">
                        {/* Customer Info */}
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2.5">
                            {appt.customerImage ? (
                              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                                <Image
                                  src={appt.customerImage}
                                  alt={appt.customerName || "Customer"}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-xs font-bold">
                                {appt.customerName ? appt.customerName.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                            <div className="min-w-0 max-w-36 lg:max-w-44">
                              <p className="truncate text-xs font-bold text-stone-900" title={appt.customerName}>
                                {appt.customerName || "Customer"}
                              </p>
                              <p className="truncate text-[11px] text-stone-400" title={appt.customerEmail}>
                                {appt.customerEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Service Info */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                              {appt.serviceImage ? (
                                <Image
                                  src={appt.serviceImage}
                                  alt={appt.serviceName}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-stone-400">
                                  <LuImage className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-36 lg:max-w-44">
                              <p className="truncate text-xs font-bold text-stone-900" title={appt.serviceName}>
                                {appt.serviceName}
                              </p>
                              {appt.category && (
                                <p className="truncate text-[10px] text-brand-primary font-medium">
                                  {appt.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Schedule */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-900">
                              <LuCalendar className="h-3.5 w-3.5 text-stone-400" />
                              <span>{appt.appointmentDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                              <LuClock className="h-3 w-3 text-stone-400" />
                              <span>{appt.appointmentTime}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price & Payment */}
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="font-fraunces font-bold text-xs sm:text-sm text-stone-900">
                              ${appt.price}
                            </span>
                            <div>
                              <span
                                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {appt.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Booking Status */}
                        <td className="px-2.5 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isConfirmed
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-stone-100 text-stone-600 border border-stone-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isConfirmed
                                  ? "bg-emerald-500"
                                  : isPending
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-stone-400"
                              }`}
                            />
                            {appt.appointmentStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedAppointment(appt)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-100 transition cursor-pointer"
                              title="View full appointment details"
                            >
                              <LuEye className="h-3.5 w-3.5 text-stone-500" />
                              <span className="hidden lg:inline">Details</span>
                            </button>

                            {/* Confirm (Rule: Only pending can be confirmed) */}
                            {isPending && (
                              <button
                                type="button"
                                onClick={() => setAppointmentToConfirm(appt)}
                                disabled={isActionLoading}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                                title="Confirm this appointment"
                              >
                                Confirm
                              </button>
                            )}

                            {/* Cancel (Rule: Admin can cancel Pending or Confirmed) */}
                            {!isCancelled && (
                              <button
                                type="button"
                                onClick={() => setAppointmentToCancel(appt)}
                                disabled={isActionLoading}
                                className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-600 shadow-2xs hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                                title="Cancel this appointment"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. VIEW APPOINTMENT DETAILS MODAL                              */}
      {/* ============================================================== */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4.5 shrink-0 bg-stone-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                  <LuCalendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-fraunces text-stone-900">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-stone-500">
                    Full overview of customer booking request
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              {/* Customer Information */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <LuUser className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Customer Information</span>
                </p>
                <div className="flex items-center gap-3">
                  {selectedAppointment.customerImage ? (
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                      <Image
                        src={selectedAppointment.customerImage}
                        alt={selectedAppointment.customerName || "Customer"}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-sm font-bold">
                      {selectedAppointment.customerName ? selectedAppointment.customerName.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-stone-900 truncate">
                      {selectedAppointment.customerName}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {selectedAppointment.customerEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <LuCreditCard className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Service Information</span>
                </p>
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                    {selectedAppointment.serviceImage ? (
                      <Image
                        src={selectedAppointment.serviceImage}
                        alt={selectedAppointment.serviceName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-stone-400">
                        <LuImage className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-stone-900">
                      {selectedAppointment.serviceName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {selectedAppointment.category && (
                        <span className="rounded-md bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                          {selectedAppointment.category}
                        </span>
                      )}
                      {selectedAppointment.duration && (
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <LuClock className="h-3 w-3 text-stone-400" />
                          {selectedAppointment.duration} mins
                        </span>
                      )}
                      <span className="font-fraunces font-bold text-sm text-stone-900">
                        ${selectedAppointment.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Schedule */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <LuCalendar className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Appointment Schedule</span>
                </p>
                <div className="grid grid-cols-2 gap-3 text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Date</span>
                    <span className="font-semibold text-stone-900">{selectedAppointment.appointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Time Slot</span>
                    <span className="font-semibold text-stone-900">{selectedAppointment.appointmentTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Booking Request Date</span>
                    <span className="font-medium text-stone-600">
                      {new Date(selectedAppointment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Payment Status</span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        selectedAppointment.paymentStatus === "Paid"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {selectedAppointment.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Message */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <LuMessageSquare className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Customer Message</span>
                </p>
                <p className="text-xs text-stone-700 italic">
                  {selectedAppointment.message && selectedAppointment.message.trim()
                    ? `"${selectedAppointment.message}"`
                    : "No special message or stylist request provided."}
                </p>
              </div>

              {/* Current Status Banner */}
              <div
                className={`rounded-2xl p-3.5 flex items-center justify-between border ${
                  selectedAppointment.appointmentStatus === "Confirmed"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : selectedAppointment.appointmentStatus === "Pending"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-stone-100 border-stone-200 text-stone-700"
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">
                    Current Status
                  </span>
                  <span className="text-sm font-bold">
                    {selectedAppointment.appointmentStatus}
                  </span>
                </div>
                {selectedAppointment.confirmedAt && (
                  <span className="text-[10px] opacity-75">
                    Confirmed on {new Date(selectedAppointment.confirmedAt).toLocaleDateString()}
                  </span>
                )}
                {selectedAppointment.cancelledAt && (
                  <span className="text-[10px] opacity-75">
                    Cancelled on {new Date(selectedAppointment.cancelledAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/60 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* Confirm Button */}
                {selectedAppointment.appointmentStatus === "Pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      const appt = selectedAppointment;
                      setSelectedAppointment(null);
                      setAppointmentToConfirm(appt);
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Confirm Appointment
                  </button>
                )}

                {/* Cancel Button */}
                {selectedAppointment.appointmentStatus !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      const appt = selectedAppointment;
                      setSelectedAppointment(null);
                      setAppointmentToCancel(appt);
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CONFIRM ACTION MODAL                                        */}
      {/* ============================================================== */}
      {appointmentToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <LuCircleCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-fraunces text-stone-900">
                  Confirm Appointment?
                </h3>
                <p className="text-xs text-stone-500">
                  Confirm booking request for customer.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 text-xs text-stone-700 space-y-1">
              <p>
                <strong>Customer:</strong> {appointmentToConfirm.customerName} (
                {appointmentToConfirm.customerEmail})
              </p>
              <p>
                <strong>Service:</strong> {appointmentToConfirm.serviceName}
              </p>
              <p>
                <strong>Schedule:</strong> {appointmentToConfirm.appointmentDate} at{" "}
                {appointmentToConfirm.appointmentTime}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAppointmentToConfirm(null)}
                disabled={actionInProgressId === appointmentToConfirm._id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAppointment(appointmentToConfirm)}
                disabled={actionInProgressId === appointmentToConfirm._id}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {actionInProgressId === appointmentToConfirm._id
                  ? "Confirming..."
                  : "Yes, Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CANCEL ACTION MODAL                                         */}
      {/* ============================================================== */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <LuTriangleAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-fraunces text-stone-900">
                  Cancel Appointment?
                </h3>
                <p className="text-xs text-stone-500">
                  This appointment will be marked as Cancelled.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 text-xs text-stone-700 space-y-1">
              <p>
                <strong>Customer:</strong> {appointmentToCancel.customerName}
              </p>
              <p>
                <strong>Service:</strong> {appointmentToCancel.serviceName}
              </p>
              <p>
                <strong>Schedule:</strong> {appointmentToCancel.appointmentDate} at{" "}
                {appointmentToCancel.appointmentTime}
              </p>
              <p className="text-[11px] text-rose-600 pt-1 font-medium">
                Note: Cancelling will immediately free up this time slot for other customers to book.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAppointmentToCancel(null)}
                disabled={actionInProgressId === appointmentToCancel._id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={() => handleCancelAppointment(appointmentToCancel)}
                disabled={actionInProgressId === appointmentToCancel._id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {actionInProgressId === appointmentToCancel._id
                  ? "Cancelling..."
                  : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
