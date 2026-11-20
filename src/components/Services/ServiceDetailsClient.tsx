"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuCheck,
  LuCircleCheck,
  LuClock,
  LuLoader,
  LuShieldCheck,
  LuTag,
  LuX,
} from "react-icons/lu";
import { useSession } from "@/lib/auth-client";
import { Service } from "@/components/Card/ServiceCard";

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:30 AM - 11:30 AM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:30 PM - 04:30 PM",
  "05:00 PM - 06:00 PM",
  "06:30 PM - 07:30 PM",
];

interface ServiceDetailsClientProps {
  service: Service;
}

export default function ServiceDetailsClient({ service }: ServiceDetailsClientProps) {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const userRole = (currentUser as { role?: string } | undefined)?.role || "user";
  const isAdmin = userRole === "admin";
  const isActive = service.status === "active";

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    date: string;
    slot: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let ignore = false;
    if (!selectedDate) {
      return;
    }

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const serverUrl =
          process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
        const serviceQuery = service?._id ? `&serviceId=${service._id}` : "";
        const res = await fetch(
          `${serverUrl}/api/appointments/booked-slots?date=${encodeURIComponent(selectedDate)}${serviceQuery}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.bookedSlots)) {
          setBookedSlots(data.bookedSlots);
          setSelectedSlot((prev) => (data.bookedSlots.includes(prev) ? "" : prev));
        }
      } catch {
        if (!ignore) {
          setBookedSlots([]);
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    };

    fetchBookedSlots();

    return () => {
      ignore = true;
    };
  }, [selectedDate, service?._id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdmin) {
      toast.error("Administrators cannot book customer appointments.");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select an appointment date.");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select an available time slot.");
      return;
    }

    setIsSubmitting(true);

    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

      const res = await fetch(`${serverUrl}/api/appointments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service._id,
          customerId: currentUser?.id,
          customerName: currentUser?.name || "Customer",
          customerEmail: currentUser?.email,
          customerRole: userRole,
          appointmentDate: selectedDate,
          appointmentTime: selectedSlot,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit appointment request.");
      }

      toast.success("Appointment request submitted successfully!");
      setBookingSuccessData({
        date: selectedDate,
        slot: selectedSlot,
      });
      setBookedSlots((prev) =>
        prev.includes(selectedSlot) ? prev : [...prev, selectedSlot]
      );
      setSelectedSlot("");
      setMessage("");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-stone-500"
        >
          <Link
            href="/"
            className="transition hover:text-brand-primary"
          >
            Home
          </Link>
          <span className="text-stone-300">/</span>
          <Link
            href="/services"
            className="transition hover:text-brand-primary"
          >
            Services
          </Link>
          <span className="text-stone-300">/</span>
          <span className="truncate font-medium text-stone-900 max-w-50 sm:max-w-none">
            {service.serviceName}
          </span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Hero Image & In-Depth Details (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            {/* Service Image Card */}
            <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-100 shadow-md">
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover object-center"
              />

              {/* Top Floating Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-brand-primary shadow-sm pointer-events-auto">
                  <LuTag className="text-sm" />
                  <span>{service.category}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md pointer-events-auto ${
                    isActive
                      ? "bg-emerald-500/90 text-white"
                      : "bg-rose-500/90 text-white"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-white animate-pulse" : "bg-white/80"
                    }`}
                  />
                  <span>{isActive ? "Available" : "Unavailable"}</span>
                </span>
              </div>
            </div>

            {/* Service Header Info */}
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-md bg-brand-light px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-primary border border-brand-primary/15">
                  {service.category}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">
                  Salon Professional Treatment
                </span>
              </div>

              <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
                {service.serviceName}
              </h1>

              {/* Highlights Ribbon */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-stone-100 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                    <LuClock className="text-xl" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-stone-800">
                      {service.duration} Minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                    <LuTag className="text-xl" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      Price
                    </p>
                    <p className="text-sm font-semibold text-brand-primary">
                      ${service.price}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                    <LuShieldCheck className="text-xl" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      Quality
                    </p>
                    <p className="text-sm font-semibold text-stone-800">
                      Certified Stylist
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mt-6">
                <h2 className="font-fraunces text-xl font-semibold text-stone-900">
                  About This Service
                </h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-600 whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Treatment Experience Details */}
              <div className="mt-8 border-t border-stone-100 pt-6">
                <h3 className="font-fraunces text-lg font-semibold text-stone-900 mb-4">
                  What to Expect from This Treatment
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-stone-600">
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <LuCheck className="text-xs" />
                    </span>
                    <span>Complimentary personalized consultation before starting</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <LuCheck className="text-xs" />
                    </span>
                    <span>Premium organic, skin-friendly and hypoallergenic products</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <LuCheck className="text-xs" />
                    </span>
                    <span>Hospital-grade sanitized tools and sterile environment</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <LuCheck className="text-xs" />
                    </span>
                    <span>Expert post-treatment styling and maintenance advice</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 flex flex-col gap-6">
              {/* Primary Booking Card */}
              <div className="overflow-hidden rounded-3xl border border-brand-primary/15 bg-white p-6 sm:p-7 shadow-xl shadow-brand-primary/5">
                {/* Price Display */}
                <div className="flex items-baseline justify-between border-b border-stone-100 pb-5 mb-6">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                      Standard Rate
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-brand-primary font-fraunces">
                        ${service.price}
                      </span>
                      <span className="text-xs font-medium text-stone-500">
                        / session
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-primary border border-brand-primary/15">
                    <LuClock className="text-sm" />
                    <span>{service.duration} mins</span>
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {/* 1. Select Appointment Date * */}
                    <div>
                      <label
                        htmlFor="appointmentDate"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                      >
                        Select Appointment Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="appointmentDate"
                        type="date"
                        min={todayStr}
                        value={selectedDate}
                        disabled={isAdmin || !isActive}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedDate(val);
                          setSelectedSlot("");
                          if (!val) {
                            setBookedSlots([]);
                          }
                        }}
                        required
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* 2. Available Time Slot * */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="availableTimeSlot"
                          className="text-xs font-semibold uppercase tracking-wider text-stone-700"
                        >
                          Available Time Slot <span className="text-rose-500">*</span>
                        </label>
                        {loadingSlots && (
                          <span className="flex items-center gap-1 text-[11px] text-brand-primary">
                            <LuLoader className="animate-spin text-xs" />
                            <span>Checking...</span>
                          </span>
                        )}
                      </div>

                      <select
                        id="availableTimeSlot"
                        value={selectedSlot}
                        disabled={isAdmin || !isActive || !selectedDate || loadingSlots}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        required
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <option value="">
                          {!selectedDate
                            ? "Select a date first..."
                            : loadingSlots
                            ? "Loading available slots..."
                            : "-- Select an Available Time Slot --"}
                        </option>
                        {TIME_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <option
                              key={slot}
                              value={slot}
                              disabled={isBooked}
                              className={isBooked ? "text-stone-400 bg-stone-100" : ""}
                            >
                              {slot} {isBooked ? "(Booked)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* 3. Additional Message / Notes */}
                    <div>
                      <label
                        htmlFor="additionalMessage"
                        className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
                      >
                        Additional Message / Notes
                      </label>
                      <textarea
                        id="additionalMessage"
                        rows={3}
                        value={message}
                        disabled={isAdmin || !isActive}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mention any preferences, stylist request, or notes..."
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-stone-800 transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/15 resize-none disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Booking Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          isAdmin ||
                          !isActive ||
                          isSubmitting ||
                          !selectedDate ||
                          !selectedSlot
                        }
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                          isAdmin || !isActive || !selectedDate || !selectedSlot
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed opacity-75"
                            : "bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-xl cursor-pointer"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <LuLoader className="text-base animate-spin" />
                            <span>Booking...</span>
                          </>
                        ) : (
                          <>
                            <LuCalendar className="text-base" />
                            <span>
                              {isAdmin
                                ? "Booking Disabled (Admin)"
                                : !isActive
                                ? "Service Unavailable"
                                : "Book Appointment"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Booking Success Popup Modal */}
      {bookingSuccessData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setBookingSuccessData(null)}
        >
          <div
            className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-7 text-center shadow-2xl transition-all border border-stone-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Icon Button */}
            <button
              type="button"
              onClick={() => setBookingSuccessData(null)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition cursor-pointer"
              aria-label="Close modal"
            >
              <LuX className="text-lg" />
            </button>

            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 ring-8 ring-emerald-50/50">
              <LuCircleCheck className="text-3xl" />
            </div>

            {/* Modal Title & Subtitle */}
            <h3 className="font-fraunces text-2xl font-bold text-stone-900 tracking-tight">
              Booking Request Sent!
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
              Your appointment request has been submitted with <span className="font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">Pending</span> status.
            </p>

            {/* Appointment Details Box */}
            <div className="mt-5 rounded-2xl border border-stone-200/90 bg-stone-50/90 p-4 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                <span className="text-stone-500 font-medium">Service</span>
                <span className="font-semibold text-stone-900 max-w-50 truncate text-right">
                  {service.serviceName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Date:</span>
                <span className="font-semibold text-stone-900">
                  {bookingSuccessData.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Time Slot:</span>
                <span className="font-semibold text-stone-900">
                  {bookingSuccessData.slot}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Service Fee:</span>
                <span className="font-bold text-brand-primary text-base">
                  ${service.price}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-500 font-medium">Payment Status:</span>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Unpaid (Pay after confirmation)
                </span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setBookingSuccessData(null)}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition hover:bg-brand-primary/90 hover:shadow-lg"
              >
                View in My Appointments
              </Link>
              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-4 py-3 text-xs sm:text-sm font-semibold text-stone-700 transition hover:bg-stone-100 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
