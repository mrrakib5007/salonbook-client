import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { headers } from "next/headers";
import { LuArrowLeft } from "react-icons/lu";
import ServiceDetailsClient from "@/components/Services/ServiceDetailsClient";
import { Service } from "@/components/Card/ServiceCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getServiceById(id: string): Promise<Service | null> {
  try {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    const res = await fetch(`${serverUrl}/api/services/${id}`, {
      cache: "no-store",
      headers: {
        cookie,
      },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service) {
    return {
      title: "Service Details | SalonBook",
      description: "Explore salon service details and book appointments online.",
    };
  }

  return {
    title: `${service.serviceName} | SalonBook`,
    description:
      service.description?.slice(0, 160) ||
      "Explore salon service details and book appointments online.",
  };
}

function ServiceDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50/50 pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-4 w-48 bg-stone-200/80 rounded-full mb-8" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="aspect-16/10 w-full rounded-3xl bg-stone-200/80" />
            <div className="h-10 w-3/4 rounded-xl bg-stone-200/80" />
            <div className="h-24 w-full rounded-2xl bg-stone-200/60" />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="h-96 w-full rounded-3xl bg-stone-200/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function ServiceDetailsContent({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const service = await getServiceById(id);

  // Requirement: Invalid service IDs or missing services should show an appropriate error message
  if (!service) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-stone-50/50">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white p-8 sm:p-10 text-center shadow-lg">         

          <span className="inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 mb-3">
            Service Not Found
          </span>

          <h1 className="font-fraunces text-2xl sm:text-3xl font-semibold text-stone-900">
            Invalid Service ID
          </h1>

          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            We couldn&apos;t find any active salon service matching this ID. The service may have been removed or the link is incorrect.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary/90"
            >
              <LuArrowLeft className="text-base" />
              <span>Browse All Services</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <ServiceDetailsClient service={service} />
    </main>
  );
}

export default function ServiceDetailsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ServiceDetailsSkeleton />}>
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}
