"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  LuBan,
  LuCalendar,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCreditCard,
  LuEye,
  LuPlus,
  LuRefreshCw,
  LuScissors,
  LuX,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

interface AppointmentItem {
  _id: string;
  serviceId: string;
  serviceName: string;
  serviceImage?: string;
  category: string;
  price: number;
  duration?: number;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  appointmentStatus: "Pending" | "Confirmed" | "Cancelled";
  paymentStatus: "Unpaid" | "Paid";
  createdAt: string;
}

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "Pending" | "Confirmed" | "Cancelled"
  >("all");

  // Modals state
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentItem | null>(null);
  const [cancellingAppointment, setCancellingAppointment] =
    useState<AppointmentItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Helper to fetch session token for cross-domain headers
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

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/customer/appointments`, {
        credentials: "include",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load appointments.");
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitial = async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${serverUrl}/api/customer/appointments`, {
          credentials: "include",
          headers: authHeaders,
        });
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setAppointments(data.appointments || []);
        } else if (!ignore && (!res.ok || !data.success)) {
          setError(data.message || "Failed to load appointments.");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load appointments."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [serverUrl]);

  // Handle Cancel Appointment
  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;

    try {
      setIsCancelling(true);
      const authHeaders = await getAuthHeaders();
      const res = await fetch(
        `${serverUrl}/api/customer/appointments/${cancellingAppointment._id}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment request.");
      }

      toast.success("Appointment request cancelled successfully.");
      // Optimistically update local state
      setAppointments((prev) =>
        prev.map((item) =>
          item._id === cancellingAppointment._id
            ? { ...item, appointmentStatus: "Cancelled" }
            : item
        )
      );

      if (selectedAppointment?._id === cancellingAppointment._id) {
        setSelectedAppointment((prev) =>
          prev ? { ...prev, appointmentStatus: "Cancelled" } : null
        );
      }
      setCancellingAppointment(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to cancel appointment request."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status: AppointmentItem["appointmentStatus"]) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
            <LuClock className="h-3 w-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <LuCircleCheck className="h-3 w-3 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-800">
            <LuCircleX className="h-3 w-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Payment Status Badge Component
  const renderPaymentBadge = (status: AppointmentItem["paymentStatus"]) => {
    if (status === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          <LuCreditCard className="h-3 w-3 text-emerald-600" />
          <span>Paid</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
        <LuCreditCard className="h-3 w-3 text-stone-400" />
        <span>Unpaid</span>
      </span>
    );
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    if (filterStatus === "all") return appointments;
    return appointments.filter((item) => item.appointmentStatus === filterStatus);
  }, [appointments, filterStatus]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      Pending: appointments.filter((a) => a.appointmentStatus === "Pending")
        .length,
      Confirmed: appointments.filter((a) => a.appointmentStatus === "Confirmed")
        .length,
      Cancelled: appointments.filter((a) => a.appointmentStatus === "Cancelled")
        .length,
    };
  }, [appointments]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            My Appointments
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-500">
            Track, review statuses, and manage your booked salon appointments
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
          <button
            type="button"
            onClick={fetchAppointments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 cursor-pointer"
          >
            <LuRefreshCw
              className={`h-3.5 w-3.5 ${
                loading ? "animate-spin text-brand-primary" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(["all", "Pending", "Confirmed", "Cancelled"] as const).map(
          (status) => {
            const isActive = filterStatus === status;
            const count = counts[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span>{status === "all" ? "All Appointments" : status}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800">
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchAppointments}
            className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 w-full animate-pulse rounded-2xl border border-stone-200/80 bg-white p-4"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAppointments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <LuCalendar className="h-7 w-7" />
          </div>
          <h3 className="font-fraunces text-lg sm:text-xl font-bold text-stone-900 mt-4">
            No Appointments Found
          </h3>
          <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-stone-500">
            {filterStatus === "all"
              ? "You have not submitted any salon appointment requests yet."
              : `You have no ${filterStatus.toLowerCase()} appointments at this moment.`}
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90"
          >
            <LuScissors className="h-4 w-4" />
            <span>Browse Salon Services</span>
          </Link>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Schedule</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Booking Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Requested On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAppointments.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-stone-50/60"
                  >
                    {/* Service Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.serviceImage ? (
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200">
                            <Image
                              src={item.serviceImage}
                              alt={item.serviceName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand-primary">
                            <LuScissors className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-50">
                          <p className="truncate font-semibold text-stone-900">
                            {item.serviceName}
                          </p>
                          <p className="truncate text-[11px] text-stone-500">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-semibold text-stone-900">
                        {item.appointmentDate}
                      </p>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <LuClock className="h-3 w-3 text-stone-400" />
                        <span>{item.appointmentTime}</span>
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-fraunces font-bold text-stone-900 text-sm">
                        ${item.price}
                      </p>
                      {item.duration && (
                        <p className="text-[10px] text-stone-400">
                          {item.duration} mins
                        </p>
                      )}
                    </td>

                    {/* Booking Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {renderStatusBadge(item.appointmentStatus)}
                    </td>

                    {/* Payment Status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {renderPaymentBadge(item.paymentStatus)}
                    </td>

                    {/* Requested Date */}
                    <td className="px-4 py-4 whitespace-nowrap text-stone-500 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => setSelectedAppointment(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-stone-700 transition hover:bg-stone-100 cursor-pointer"
                          title="View Details"
                        >
                          <LuEye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </button>

                        {/* Pay Now Button (Only Confirmed & Unpaid) */}
                        {item.appointmentStatus === "Confirmed" &&
                          item.paymentStatus === "Unpaid" && (
                            <button
                              type="button"
                              onClick={() => {
                                toast(
                                  "Stripe Checkout flow will be initiated for this confirmed appointment.",
                                  { icon: "💳" }
                                );
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer"
                            >
                              <LuCreditCard className="h-3.5 w-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}

                        {/* Cancel Button (Only Pending) */}
                        {item.appointmentStatus === "Pending" && (
                          <button
                            type="button"
                            onClick={() => setCancellingAppointment(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                            title="Cancel Request"
                          >
                            <LuBan className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && filteredAppointments.length > 0 && (
        <div className="space-y-3.5 md:hidden">
          {filteredAppointments.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs"
            >
              {/* Header: Service image + Name + Category + Price */}
              <div className="flex items-start gap-3">
                {item.serviceImage ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-200">
                    <Image
                      src={item.serviceImage}
                      alt={item.serviceName}
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
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-stone-900 text-sm leading-snug">
                      {item.serviceName}
                    </h4>
                    <span className="font-fraunces font-bold text-stone-900 text-base shrink-0">
                      ${item.price}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.category}
                  </p>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-2.5 text-xs text-stone-700">
                <div className="flex items-center gap-1.5">
                  <LuCalendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{item.appointmentDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LuClock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{item.appointmentTime}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2">
                  {renderStatusBadge(item.appointmentStatus)}
                  {renderPaymentBadge(item.paymentStatus)}
                </div>
                <span className="text-[11px] text-stone-400">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2 border-t border-stone-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(item)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 cursor-pointer"
                >
                  <LuEye className="h-3.5 w-3.5" />
                  <span>Details</span>
                </button>

                {item.appointmentStatus === "Confirmed" &&
                  item.paymentStatus === "Unpaid" && (
                    <button
                      type="button"
                      onClick={() => {
                        toast(
                          "Stripe Checkout flow will be initiated for this confirmed appointment.",
                          { icon: "💳" }
                        );
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer"
                    >
                      <LuCreditCard className="h-3.5 w-3.5" />
                      <span>Pay Now</span>
                    </button>
                  )}

                {item.appointmentStatus === "Pending" && (
                  <button
                    type="button"
                    onClick={() => setCancellingAppointment(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                  >
                    <LuBan className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <h3 className="font-fraunces text-lg font-bold text-stone-900">
                Appointment Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                aria-label="Close modal"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-6">
              {/* Service header */}
              <div className="flex items-center gap-4">
                {selectedAppointment.serviceImage ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200">
                    <Image
                      src={selectedAppointment.serviceImage}
                      alt={selectedAppointment.serviceName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                    <LuScissors className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <h4 className="font-fraunces text-base font-bold text-stone-900">
                    {selectedAppointment.serviceName}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {selectedAppointment.category}
                  </p>
                  <p className="font-fraunces text-brand-primary font-bold text-base mt-1">
                    ${selectedAppointment.price}
                  </p>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-stone-50 p-3 text-xs">
                <div>
                  <span className="text-[11px] text-stone-400 block mb-1">
                    Booking Status
                  </span>
                  {renderStatusBadge(selectedAppointment.appointmentStatus)}
                </div>
                <div className="ml-auto text-right">
                  <span className="text-[11px] text-stone-400 block mb-1">
                    Payment Status
                  </span>
                  {renderPaymentBadge(selectedAppointment.paymentStatus)}
                </div>
              </div>

              {/* Grid of detail rows */}
              <div className="divide-y divide-stone-100 text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <LuCalendar className="h-3.5 w-3.5 text-stone-400" />
                    <span>Appointment Date</span>
                  </span>
                  <span className="font-semibold text-stone-900">
                    {selectedAppointment.appointmentDate}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <LuClock className="h-3.5 w-3.5 text-stone-400" />
                    <span>Time Slot</span>
                  </span>
                  <span className="font-semibold text-stone-900">
                    {selectedAppointment.appointmentTime}
                  </span>
                </div>
                {selectedAppointment.duration && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-stone-500">Duration</span>
                    <span className="font-semibold text-stone-900">
                      {selectedAppointment.duration} Minutes
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-stone-500">Request Submitted</span>
                  <span className="font-semibold text-stone-900">
                    {formatDate(selectedAppointment.createdAt)}
                  </span>
                </div>
              </div>

              {/* Message / Stylist Notes */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block mb-1.5">
                  Your Message / Preferences
                </span>
                <div className="rounded-xl border border-stone-200/90 bg-stone-50 p-3 text-xs text-stone-700 leading-relaxed">
                  {selectedAppointment.message ? (
                    selectedAppointment.message
                  ) : (
                    <span className="italic text-stone-400">
                      No additional message provided.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-stone-100 bg-stone-50/60 px-6 py-4 flex items-center justify-end gap-2.5">
              {selectedAppointment.appointmentStatus === "Pending" && (
                <button
                  type="button"
                  onClick={() => {
                    setCancellingAppointment(selectedAppointment);
                  }}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 cursor-pointer"
                >
                  Cancel Request
                </button>
              )}
              {selectedAppointment.appointmentStatus === "Confirmed" &&
                selectedAppointment.paymentStatus === "Unpaid" && (
                  <button
                    type="button"
                    onClick={() => {
                      toast(
                        "Stripe Checkout flow will be initiated for this confirmed appointment.",
                        { icon: "💳" }
                      );
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer"
                  >
                    Pay Now (${selectedAppointment.price})
                  </button>
                )}
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingAppointment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (!isCancelling) setCancellingAppointment(null);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
              <LuBan className="h-6 w-6" />
            </div>

            <h3 className="font-fraunces text-xl font-bold text-stone-900">
              Cancel Appointment Request?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Are you sure you want to cancel your request for{" "}
              <strong className="text-stone-900">
                {cancellingAppointment.serviceName}
              </strong>{" "}
              on{" "}
              <strong className="text-stone-900">
                {cancellingAppointment.appointmentDate} ({cancellingAppointment.appointmentTime})
              </strong>
              ?
            </p>
            <p className="mt-2 text-xs text-stone-400">
              Once cancelled, this time slot will become available for other customers, and your request will be marked as Cancelled.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                disabled={isCancelling}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
