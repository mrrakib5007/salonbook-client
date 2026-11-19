"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LuArrowUpDown,
  LuChevronDown,
  LuLayers,
  LuRotateCcw,
  LuSearch,
  LuSearchX,
  LuX,
} from "react-icons/lu";
import ServiceCard, { Service } from "@/components/Card/ServiceCard";
import ServicesSkeleton from "./ServicesSkeleton";

interface CategoryItem {
  _id: string;
  name: string;
  icon?: string;
}

export default function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Single Source of Truth directly from URL search params
  const selectedCategory = searchParams.get("category") || "All";
  const searchFromUrl = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "";

  // Local state for smooth text typing in search input
  const [searchInput, setSearchInput] = useState<string>(searchFromUrl);
  const [prevSearchFromUrl, setPrevSearchFromUrl] = useState<string>(searchFromUrl);

  // Sync search input if URL search param changes externally
  if (prevSearchFromUrl !== searchFromUrl) {
    setPrevSearchFromUrl(searchFromUrl);
    setSearchInput(searchFromUrl);
  }

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Debounce search input and update URL accordingly
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed !== searchFromUrl) {
        setLoading(true);
        const params = new URLSearchParams(searchParams.toString());
        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }
        const query = params.toString();
        router.replace(query ? `/services?${query}` : "/services", { scroll: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, searchFromUrl, searchParams, router]);

  // Load Categories on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        const res = await fetch(`${serverUrl}/api/categories`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && Array.isArray(json?.data)) {
          setCategories(json.data);
        }
      } catch {
        // Fallback silently if API is offline
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [serverUrl]);

  // Fetch Services from API whenever URL filters (category, search, sort) change
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadServices() {
      try {
        const params = new URLSearchParams();

        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

        if (searchFromUrl) {
          params.set("search", searchFromUrl);
        }

        if (sortBy) {
          params.set("sort", sortBy);
        }

        const res = await fetch(`${serverUrl}/api/services?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          if (isMounted) {
            setServices([]);
            setLoading(false);
          }
          return;
        }

        const json = await res.json();
        if (isMounted) {
          setServices(Array.isArray(json?.data) ? json.data : []);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setServices([]);
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedCategory, searchFromUrl, sortBy, serverUrl]);

  // Handle Category selection
  const handleCategorySelect = (categoryName: string) => {
    setLoading(true);

    const params = new URLSearchParams(searchParams.toString());
    if (categoryName && categoryName !== "All") {
      params.set("category", categoryName);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.replace(query ? `/services?${query}` : "/services", { scroll: false });
  };

  // Handle Search Input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Handle Sort By change
  const handleSortChange = (value: string) => {
    setLoading(true);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    const query = params.toString();
    router.replace(query ? `/services?${query}` : "/services", { scroll: false });
  };

  // Handle Reset all filters
  const handleResetFilters = () => {
    setSearchInput("");
    setLoading(true);
    router.replace("/services", { scroll: false });
  };

  return (
    <div className="w-full">
      {/* 1. Header Banner */}
      <section className="relative w-full border-b border-brand-primary/10 bg-linear-to-b from-brand-light/60 via-brand-light/25 to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900">
              Explore Salon Services
            </h1>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-stone-600">
              Browse our complete range of certified salon treatments, haircuts,
              coloring, and wellness packages. Select your favorite service to
              book an appointment.
            </p>
          </div>

          {/* 2. Control Bar: Search Input, Category Select & Sort Dropdown */}
          <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-3.5 sm:gap-4">
            {/* Search Input Box */}
            <div className="relative flex-1 w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <LuSearch className="text-lg" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search services by name (e.g. Haircut, Facial)..."
                className="w-full rounded-2xl border border-stone-200/90 bg-white py-3.5 pl-11 pr-10 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition-all focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-primary/15"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition"
                  aria-label="Clear search"
                >
                  <LuX className="text-base" />
                </button>
              )}
            </div>

            {/* Category Select Dropdown */}
            <div className="relative w-full md:w-56 lg:w-64 shrink-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <LuLayers className="text-base" />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-stone-200/90 bg-white py-3.5 pl-10 pr-10 text-sm font-medium text-stone-800 shadow-2xs transition-all focus:border-brand-primary focus:outline-none focus:ring-3 focus:ring-brand-primary/15 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                <LuChevronDown className="text-sm" />
              </div>
            </div>

            {/* Price Sort Dropdown */}
            <div className="relative w-full md:w-56 lg:w-60 shrink-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <LuArrowUpDown className="text-base" />
              </div>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-stone-200/90 bg-white py-3.5 pl-10 pr-10 text-sm font-medium text-stone-800 shadow-2xs transition-all focus:border-brand-primary focus:outline-none focus:ring-3 focus:ring-brand-primary/15 cursor-pointer"
              >
                <option value="">Sort by: Default (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
                <LuChevronDown className="text-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section: Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Main Content: Skeleton vs Cards vs Empty State */}
        {loading ? (
          <ServicesSkeleton count={6} />
        ) : services.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-primary/20 bg-brand-light/20 px-6 py-20 text-center">
            <span className="flex h-18 w-18 items-center justify-center rounded-2xl bg-brand-light text-brand-primary shadow-xs">
              <LuSearchX className="text-3xl" />
            </span>

            <h3 className="mt-5 font-fraunces text-2xl font-semibold text-stone-900">
              No matching services found
            </h3>

            <p className="mt-2.5 max-w-md text-sm text-stone-500 leading-relaxed">
              We couldn&apos;t find any services matching your current filters or
              search query. Try adjusting your keyword or reset filters.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/90 focus:outline-none"
            >
              <LuRotateCcw className="text-sm" />
              <span>Clear All Filters</span>
            </button>
          </div>
        ) : (
          /* Responsive Services Grid: 3 in a row on PC / desktop */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
