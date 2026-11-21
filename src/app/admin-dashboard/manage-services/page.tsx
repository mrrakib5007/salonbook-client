"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LuCircleAlert,
  LuClock,
  LuImage,
  LuLoader,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuRotateCcw,
  LuScissors,
  LuSearch,
  LuTrash2,
  LuTriangleAlert,
  LuUpload,
  LuX,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

export interface SalonService {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

const FALLBACK_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
];

export default function ManageServicesPage() {
  // Services list & loading state
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_asc" | "price_desc" | "name_asc">("newest");

  // Modal: Add / Update Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Form Fields state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(FALLBACK_CATEGORIES[0]);
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<string>("");
  const [formDuration, setFormDuration] = useState<string>("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [formImage, setFormImage] = useState<string>("");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete modal state
  const [serviceToDelete, setServiceToDelete] = useState<SalonService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggling status in-flight IDs
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});

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

  // Fetch all services for admin
  const fetchServices = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const authHeaders = await getAuthHeaders();
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`${serverUrl}/api/admin/services?${params.toString()}`, {
        credentials: "include",
        headers: authHeaders,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch salon services");
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setServices(data.data);
      } else {
        throw new Error(data.message || "Failed to load services data");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error fetching services";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedStatus, searchTerm, sortBy, serverUrl]);

  // Fetch categories list
  useEffect(() => {
    let ignore = false;
    async function loadCategories() {
      try {
        const res = await fetch(`${serverUrl}/api/categories`);
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.data)) {
          const names = data.data
            .map((cat: { categoryName?: string; name?: string }) => cat.categoryName || cat.name)
            .filter(Boolean) as string[];

          if (names.length > 0) {
            // Merge with fallback and deduplicate
            const unique = Array.from(new Set([...names, ...FALLBACK_CATEGORIES]));
            setCategories(unique);
            setFormCategory(unique[0]);
          }
        }
      } catch {
        // Fallback already pre-set
      }
    }

    loadCategories();
    return () => {
      ignore = true;
    };
  }, [serverUrl]);

  // Load services whenever filters change (with debounce on search)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchServices]);

  // Open Add Service Modal
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingServiceId(null);
    setFormName("");
    setFormCategory(categories[0] || FALLBACK_CATEGORIES[0]);
    setFormDescription("");
    setFormPrice("");
    setFormDuration("");
    setFormStatus("active");
    setFormImage("");
    setSelectedFile(null);
    setImagePreview("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Service Modal
  const handleOpenEditModal = (service: SalonService) => {
    setModalMode("edit");
    setEditingServiceId(service._id);
    setFormName(service.serviceName);
    setFormCategory(service.category);
    setFormDescription(service.description);
    setFormPrice(String(service.price));
    setFormDuration(String(service.duration));
    setFormStatus(service.status);
    setFormImage(service.image);
    setSelectedFile(null);
    setImagePreview(service.image);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    if (submittingForm || uploadingImage) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    setImagePreview("");
    setFormError(null);
  };

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image file size exceeds the 10MB limit.");
      toast.error("File size must be under 10MB");
      return;
    }

    // Validate image MIME type
    if (!file.type.startsWith("image/")) {
      setFormError("Only image files (JPG, PNG, WEBP) are supported.");
      toast.error("Invalid image file type");
      return;
    }

    setSelectedFile(file);
    setFormError(null);

    // Create local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to ImgBB via /api/upload
  const uploadImageToImgbb = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/upload`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data?.message || "Failed to upload image to ImgBB");
      }

      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Add or Update Service Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validation
    if (!formName.trim()) {
      setFormError("Please enter the service name.");
      return;
    }
    if (!formCategory.trim()) {
      setFormError("Please select a category.");
      return;
    }
    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError("Price must be a positive number greater than 0.");
      return;
    }
    const numDuration = Number(formDuration);
    if (isNaN(numDuration) || numDuration <= 0) {
      setFormError("Duration must be a positive number (in minutes).");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Please enter a service description.");
      return;
    }

    // Image upload validation (Requirements: Service Image Upload required, not URL)
    let imageUrl = formImage;
    if (modalMode === "create" && !selectedFile && !imageUrl) {
      setFormError("Please upload a service image.");
      return;
    }

    setSubmittingForm(true);

    try {
      // If a new file was chosen, upload to ImgBB
      if (selectedFile) {
        toast.loading("Uploading service image to ImgBB...", { id: "upload-toast" });
        imageUrl = await uploadImageToImgbb(selectedFile);
        toast.success("Image uploaded successfully!", { id: "upload-toast" });
      }

      const authHeaders = await getAuthHeaders();
      const payload = {
        serviceName: formName.trim(),
        category: formCategory.trim(),
        description: formDescription.trim(),
        price: numPrice,
        duration: Math.round(numDuration),
        image: imageUrl,
        status: formStatus,
      };

      if (modalMode === "create") {
        // POST /api/admin/services
        const res = await fetch(`${serverUrl}/api/admin/services`, {
          method: "POST",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to create service");
        }

        toast.success("New service added successfully!");
      } else {
        // PUT /api/admin/services/:id
        const res = await fetch(`${serverUrl}/api/admin/services/${editingServiceId}`, {
          method: "PUT",
          headers: {
            ...authHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to update service");
        }

        toast.success("Service updated successfully!");
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save service";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmittingForm(false);
    }
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (service: SalonService) => {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    const serviceId = service._id;

    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => (s._id === serviceId ? { ...s, status: nextStatus } : s))
    );
    setTogglingIds((prev) => ({ ...prev, [serviceId]: true }));

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/admin/services/${serviceId}/status`, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update service status");
      }

      toast.success(
        `"${service.serviceName}" is now ${nextStatus === "active" ? "Active" : "Inactive"}`
      );
    } catch (err) {
      // Revert optimistic update
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, status: service.status } : s))
      );
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setTogglingIds((prev) => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    }
  };

  // Delete service execution
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/admin/services/${serviceToDelete._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service");
      }

      toast.success(`Service "${serviceToDelete.serviceName}" deleted!`);
      setServices((prev) => prev.filter((s) => s._id !== serviceToDelete._id));
      setServiceToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete service");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-stone-900 tracking-tight">
            Manage Salon Services
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create, update, activate, deactivate, or delete salon service offerings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchServices(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <LuRefreshCw
              className={`h-4 w-4 text-stone-500 ${
                refreshing ? "animate-spin text-brand-primary" : ""
              }`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 transition cursor-pointer"
          >
            <LuPlus className="h-4 w-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && !loading && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <LuCircleAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <p className="mt-0.5 text-rose-600">Please check your network connection or try refreshing the list.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchServices(true)}
            className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <LuSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service name, category, or description..."
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

        {/* Category Filter */}
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "inactive")}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:w-44">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | "newest"
                  | "oldest"
                  | "price_asc"
                  | "price_desc"
                  | "name_asc"
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Services Table Card */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs">
        {loading && !refreshing ? (
          /* Loading Skeletons */
          <div className="p-4 sm:p-6 space-y-3.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 animate-pulse py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-stone-200 shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="h-3.5 w-32 sm:w-44 rounded-md bg-stone-200" />
                    <div className="h-2.5 w-24 sm:w-56 rounded-md bg-stone-100" />
                  </div>
                </div>
                <div className="hidden sm:block h-5 w-16 rounded-full bg-stone-100 shrink-0" />
                <div className="h-4 w-10 rounded-md bg-stone-200 shrink-0" />
                <div className="h-7 w-20 rounded-xl bg-stone-100 shrink-0" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-primary mb-3.5">
              <LuScissors className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-fraunces">
              No salon services found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try clearing your filters or search term to see more services."
                : "Your salon catalog is currently empty. Click below to add your first service."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  <LuRotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary/90 cursor-pointer"
              >
                <LuPlus className="h-4 w-4" />
                <span>Add First Service</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile Cards View (Zero horizontal scroll on mobile) */}
            <div className="block md:hidden divide-y divide-stone-100">
              {services.map((service) => {
                const isToggling = Boolean(togglingIds[service._id]);
                const isActive = service.status === "active";

                return (
                  <div key={service._id} className="p-4 transition hover:bg-stone-50/50">
                    <div className="flex items-start gap-3">
                      {/* Service Thumbnail */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                        {service.image ? (
                          <Image
                            src={service.image}
                            alt={service.serviceName}
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

                      {/* Service Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="truncate text-xs sm:text-sm font-bold text-stone-900"
                            title={service.serviceName}
                          >
                            {service.serviceName}
                          </h4>
                          <span className="font-fraunces font-bold text-sm text-stone-900 shrink-0">
                            ${service.price}
                          </span>
                        </div>

                        <p
                          className="line-clamp-1 text-[11px] text-stone-500 mt-0.5"
                          title={service.description}
                        >
                          {service.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center rounded-md border border-brand-primary/20 bg-brand-light/70 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                            {service.category}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                            <LuClock className="h-3 w-3 text-stone-400" />
                            {service.duration} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status & Actions Bar */}
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(service)}
                        disabled={isToggling}
                        className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer disabled:opacity-60 ${
                          isActive
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-stone-300 bg-stone-100 text-stone-600"
                        }`}
                        title={`Click to ${isActive ? "Deactivate" : "Activate"} this service`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
                          }`}
                        />
                        <span>{isToggling ? "Updating..." : isActive ? "Active" : "Inactive"}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(service)}
                          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                        >
                          <LuPencil className="h-3.5 w-3.5 text-stone-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setServiceToDelete(service)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <LuTrash2 className="h-3.5 w-3.5 text-rose-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Compact Service Details to prevent horizontal overflow on PC) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-3.5 py-3 w-56 lg:w-72">Service Details</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Duration</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Visibility Status</th>
                    <th className="px-3.5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {services.map((service) => {
                    const isToggling = Boolean(togglingIds[service._id]);
                    const isActive = service.status === "active";

                    return (
                      <tr
                        key={service._id}
                        className="transition hover:bg-stone-50/60"
                      >
                        {/* Service Thumbnail & Info - Compact width */}
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                              {service.image ? (
                                <Image
                                  src={service.image}
                                  alt={service.serviceName}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-stone-400">
                                  <LuImage className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-44 lg:max-w-56">
                              <p
                                className="truncate text-xs font-bold text-stone-900"
                                title={service.serviceName}
                              >
                                {service.serviceName}
                              </p>
                              <p
                                className="truncate text-[11px] text-stone-400 mt-0.5"
                                title={service.description}
                              >
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-lg border border-brand-primary/20 bg-brand-light/70 px-2.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                            {service.category}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="px-3 py-3 whitespace-nowrap text-stone-600">
                          <div className="flex items-center gap-1.5 font-medium">
                            <LuClock className="h-3.5 w-3.5 text-stone-400" />
                            <span>{service.duration} mins</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-3 py-3 whitespace-nowrap font-fraunces font-bold text-xs sm:text-sm text-stone-900">
                          ${service.price}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(service)}
                            disabled={isToggling}
                            className={`group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer disabled:opacity-60 ${
                              isActive
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                : "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                            title={`Click to ${isActive ? "Deactivate" : "Activate"} this service`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
                              }`}
                            />
                            <span>{isToggling ? "Updating..." : isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(service)}
                              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-100 hover:text-stone-900 transition cursor-pointer"
                              title="Edit Service"
                            >
                              <LuPencil className="h-3 w-3 text-stone-500" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setServiceToDelete(service)}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2 py-1 text-xs font-medium text-rose-600 shadow-2xs hover:bg-rose-50 transition cursor-pointer"
                              title="Delete Service"
                            >
                              <LuTrash2 className="h-3 w-3 text-rose-500" />
                              <span>Delete</span>
                            </button>
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
      {/* ADD / UPDATE SERVICE MODAL                                     */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4.5 shrink-0 bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                  <LuScissors className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-fraunces text-stone-900">
                    {modalMode === "create" ? "Add New Salon Service" : "Update Salon Service"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Fill in the required service details and upload a photo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submittingForm || uploadingImage}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer disabled:opacity-50"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800 text-xs">
                  <LuCircleAlert className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Service Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Hot Stone Relaxation Massage"
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 transition focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Category & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-900 transition focus:border-brand-primary focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Service Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "active" | "inactive")}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-900 transition focus:border-brand-primary focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active (Visible & Bookable)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Price & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Price ($ USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="120.00"
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-8 pr-3.5 text-xs sm:text-sm text-stone-900 transition focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Estimated Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="5"
                      min="5"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="60"
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-3.5 pr-14 text-xs sm:text-sm text-stone-900 transition focus:border-brand-primary focus:outline-none"
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
                      mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Image Upload (Requirement: File Upload, NOT URL) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Service Image <span className="text-rose-500">* (Direct Image Upload)</span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white">
                        <Image
                          src={imagePreview}
                          alt="Service preview"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          {selectedFile ? selectedFile.name : "Current Image Selected"}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {selectedFile
                            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload to ImgBB`
                            : "Click below to change or upload a new photo"}
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
                        >
                          Change Photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-6 text-center transition hover:border-brand-primary hover:bg-brand-light/20 cursor-pointer"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs text-brand-primary mb-2">
                      <LuUpload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-stone-800">
                      Click to upload service image
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      PNG, JPG, or WEBP up to 10MB (Stored on ImgBB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the treatments, techniques, benefits, and what customers can expect..."
                  required
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-stone-900 transition focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submittingForm || uploadingImage}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingForm || uploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 transition cursor-pointer disabled:opacity-50"
                >
                  {(submittingForm || uploadingImage) && (
                    <LuLoader className="h-4 w-4 animate-spin text-white" />
                  )}
                  <span>
                    {uploadingImage
                      ? "Uploading Image..."
                      : submittingForm
                      ? "Saving..."
                      : modalMode === "create"
                      ? "Create Service"
                      : "Save Changes"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION DIALOG                                     */}
      {/* ============================================================== */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <LuTriangleAlert className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-bold font-fraunces text-stone-900">
                Delete Salon Service?
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Are you sure you want to permanently delete{" "}
                <strong className="text-stone-800">
                  &ldquo;{serviceToDelete.serviceName}&rdquo;
                </strong>
                ? This action cannot be undone and will remove it from the catalog.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <LuLoader className="h-4 w-4 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Yes, Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
