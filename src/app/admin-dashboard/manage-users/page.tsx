"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuCircleAlert,
  LuCircleCheck,
  LuEye,
  LuPhone,
  LuRotateCcw,
  LuSearch,
  LuShieldAlert,
  LuTriangleAlert,
  LuUser,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

export interface SalonUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  isBlocked: boolean;
  phone?: string;
  createdAt?: string;
  totalBookings?: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<SalonUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "blocked">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<SalonUser | null>(null);
  const [userToBlock, setUserToBlock] = useState<SalonUser | null>(null);
  const [userToUnblock, setUserToUnblock] = useState<SalonUser | null>(null);

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

  // Fetch users
  const fetchUsers = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const authHeaders = await getAuthHeaders();
        const params = new URLSearchParams();

        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (sortBy) params.append("sort", sortBy);

        const res = await fetch(
          `${serverUrl}/api/admin/users?${params.toString()}`,
          {
            headers: {
              ...authHeaders,
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load registered customers");
        }

        setUsers(data.users || []);
      } catch (err) {
        console.error("Error fetching admin users:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect to the server. Please verify your internet connection."
        );
      } finally {
        setLoading(false);
      }
    },
    [serverUrl, searchTerm, selectedStatus, sortBy]
  );

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Handle Block User
  const handleBlockUser = async (user: SalonUser) => {
    try {
      setActionInProgressId(user._id);
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/admin/users/${user._id}/block`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to block user");
      }

      toast.success(data.message || "Customer account has been blocked.");

      // Update state in place
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBlocked: true } : u))
      );

      // If details modal is open for this user, update it
      if (selectedUser?._id === user._id) {
        setSelectedUser((prev) => (prev ? { ...prev, isBlocked: true } : null));
      }

      setUserToBlock(null);
    } catch (err) {
      console.error("Error blocking user:", err);
      toast.error(err instanceof Error ? err.message : "Failed to block customer.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Unblock User
  const handleUnblockUser = async (user: SalonUser) => {
    try {
      setActionInProgressId(user._id);
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`${serverUrl}/api/admin/users/${user._id}/unblock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to unblock user");
      }

      toast.success(data.message || "Customer account has been unblocked.");

      // Update state in place
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isBlocked: false } : u))
      );

      // If details modal is open for this user, update it
      if (selectedUser?._id === user._id) {
        setSelectedUser((prev) => (prev ? { ...prev, isBlocked: false } : null));
      }

      setUserToUnblock(null);
    } catch (err) {
      console.error("Error unblocking user:", err);
      toast.error(err instanceof Error ? err.message : "Failed to unblock customer.");
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-stone-900 tracking-tight">
            Manage Salon Customers
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            View registered customer profiles, inspect booking history, and manage account access.
          </p>
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
            onClick={() => fetchUsers()}
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
            placeholder="Search by customer name or email..."
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
              setSelectedStatus(e.target.value as "all" | "active" | "blocked")
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Accounts</option>
            <option value="blocked">Blocked Accounts</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:w-44">
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as "newest" | "oldest" | "name_asc" | "name_desc"
              )
            }
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition focus:border-brand-primary focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest Registered</option>
            <option value="oldest">Oldest Registered</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Users Container */}
      <div className="overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs">
        {loading ? (
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
                <div className="hidden sm:block h-5 w-20 rounded-full bg-stone-100 shrink-0" />
                <div className="h-4 w-16 rounded-md bg-stone-200 shrink-0" />
                <div className="h-7 w-20 rounded-xl bg-stone-100 shrink-0" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand-primary mb-3.5">
              <LuUsers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-fraunces">
              No registered customers found
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              {searchTerm || selectedStatus !== "all"
                ? "No customer accounts match your search or filter criteria. Try clearing filters."
                : "No customer accounts have registered on the platform yet."}
            </p>
            {(searchTerm || selectedStatus !== "all") && (
              <div className="mt-5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
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
              {users.map((user) => {
                const isBlocked = Boolean(user.isBlocked);
                const isActionLoading = actionInProgressId === user._id;

                return (
                  <div key={user._id} className="p-4 transition hover:bg-stone-50/50">
                    <div className="flex items-start justify-between gap-3">
                      {/* Customer Info & Avatar */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {user.image ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                            <Image
                              src={user.image}
                              alt={user.name || "Customer"}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-xs font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-stone-900" title={user.name}>
                            {user.name || "Customer"}
                          </p>
                          <p className="truncate text-[11px] text-stone-500" title={user.email}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                          isBlocked
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isBlocked ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-2.5">
                      <span className="flex items-center gap-1">
                        <LuCalendar className="h-3.5 w-3.5 text-stone-400" />
                        <span>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Registered User"}
                        </span>
                      </span>

                      <span className="font-medium text-stone-700">
                        {user.totalBookings || 0} Bookings
                      </span>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50 cursor-pointer"
                      >
                        <LuEye className="h-3.5 w-3.5 text-stone-500" />
                        <span>Details</span>
                      </button>

                      {isBlocked ? (
                        <button
                          type="button"
                          onClick={() => setUserToUnblock(user)}
                          disabled={isActionLoading}
                          className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUserToBlock(user)}
                          disabled={isActionLoading}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                        >
                          Block
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
                    <th className="px-3.5 py-3 w-56 lg:w-64">Customer</th>
                    <th className="px-3 py-3 whitespace-nowrap">Status</th>
                    <th className="px-3 py-3 whitespace-nowrap">Contact</th>
                    <th className="px-3 py-3 whitespace-nowrap">Registered</th>
                    <th className="px-2.5 py-3 whitespace-nowrap">Bookings</th>
                    <th className="px-3.5 py-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((user) => {
                    const isBlocked = Boolean(user.isBlocked);
                    const isActionLoading = actionInProgressId === user._id;

                    return (
                      <tr key={user._id} className="transition hover:bg-stone-50/60">
                        {/* Customer Info */}
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2.5">
                            {user.image ? (
                              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                                <Image
                                  src={user.image}
                                  alt={user.name || "Customer"}
                                  fill
                                  sizes="32px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-xs font-bold">
                                {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                            <div className="min-w-0 max-w-40 lg:max-w-48">
                              <p className="truncate text-xs font-bold text-stone-900" title={user.name}>
                                {user.name || "Customer"}
                              </p>
                              <p className="truncate text-[11px] text-stone-400" title={user.email}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isBlocked
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isBlocked ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            />
                            {isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-3 whitespace-nowrap text-stone-600">
                          {user.phone ? (
                            <span className="flex items-center gap-1.5 text-xs">
                              <LuPhone className="h-3 w-3 text-stone-400" />
                              <span>{user.phone}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Not set</span>
                          )}
                        </td>

                        {/* Registered Date */}
                        <td className="px-3 py-3 whitespace-nowrap text-stone-600 text-xs">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Registered"}
                        </td>

                        {/* Total Bookings */}
                        <td className="px-2.5 py-3 whitespace-nowrap font-medium text-stone-800">
                          <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs">
                            {user.totalBookings || 0}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-700 shadow-2xs hover:bg-stone-100 transition cursor-pointer"
                              title="View full customer details"
                            >
                              <LuEye className="h-3.5 w-3.5 text-stone-500" />
                              <span className="hidden lg:inline">Details</span>
                            </button>

                            {/* Block / Unblock Button (Without Icons as requested) */}
                            {isBlocked ? (
                              <button
                                type="button"
                                onClick={() => setUserToUnblock(user)}
                                disabled={isActionLoading}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                                title="Unblock this customer"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setUserToBlock(user)}
                                disabled={isActionLoading}
                                className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 shadow-2xs hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                                title="Block this customer"
                              >
                                Block
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
      {/* 1. VIEW USER DETAILS MODAL                                     */}
      {/* ============================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4.5 shrink-0 bg-stone-50/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light text-brand-primary">
                  <LuUser className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-fraunces text-stone-900">
                    Customer Details
                  </h3>
                  <p className="text-xs text-stone-500">
                    Complete profile and salon account information
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer"
              >
                <LuX className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
              {/* Profile Card */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4">
                <div className="flex items-center gap-3.5">
                  {selectedUser.image ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100">
                      <Image
                        src={selectedUser.image}
                        alt={selectedUser.name || "Customer"}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-primary text-base font-bold">
                      {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-base text-stone-900 truncate">
                      {selectedUser.name || "Customer"}
                    </h4>
                    <p className="text-xs text-stone-500 truncate mt-0.5">
                      {selectedUser.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md border border-brand-primary/20 bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand-primary uppercase tracking-wide">
                        Role: {selectedUser.role}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          selectedUser.isBlocked
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {selectedUser.isBlocked ? "Blocked Account" : "Active Account"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Information */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Account Details
                </p>
                <div className="grid grid-cols-2 gap-3 text-stone-700">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Customer ID</span>
                    <span className="font-mono text-[11px] text-stone-600 break-all">
                      {selectedUser._id}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Contact Phone</span>
                    <span className="font-semibold text-stone-900">
                      {selectedUser.phone || "Not provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Registration Date</span>
                    <span className="font-medium text-stone-800">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString()
                        : "Registered"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Total Salon Bookings</span>
                    <span className="font-bold text-sm text-stone-900">
                      {selectedUser.totalBookings || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Warning if Blocked */}
              {selectedUser.isBlocked ? (
                <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-rose-800">
                  <LuShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs">Customer Account is Blocked</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      This customer is currently restricted from submitting appointment booking requests or accessing protected customer portal features.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-900">
                  <LuCircleCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-xs">Active Customer Account</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      This customer is in good standing and has full access to browse and book salon services.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Actions */}
            <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/60 px-6 py-4 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Close
              </button>

              <div>
                {selectedUser.isBlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setUserToUnblock(u);
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Unblock Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      setUserToBlock(u);
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    Block Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BLOCK CONFIRMATION MODAL                                    */}
      {/* ============================================================== */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <LuTriangleAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-fraunces text-stone-900">
                  Block Customer Account?
                </h3>
                <p className="text-xs text-stone-500">
                  Restrict this user from accessing platform features.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 text-xs text-stone-700 space-y-1">
              <p>
                <strong>Customer:</strong> {userToBlock.name || "Customer"}
              </p>
              <p>
                <strong>Email:</strong> {userToBlock.email}
              </p>
              <p className="text-[11px] text-rose-600 pt-1 font-medium">
                Warning: Once blocked, this customer will be prevented from booking salon services or accessing protected customer portal features.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToBlock(null)}
                disabled={actionInProgressId === userToBlock._id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBlockUser(userToBlock)}
                disabled={actionInProgressId === userToBlock._id}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {actionInProgressId === userToBlock._id
                  ? "Blocking..."
                  : "Yes, Block Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. UNBLOCK CONFIRMATION MODAL                                  */}
      {/* ============================================================== */}
      {userToUnblock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <LuCircleCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold font-fraunces text-stone-900">
                  Unblock Customer Account?
                </h3>
                <p className="text-xs text-stone-500">
                  Restore customer access to the platform.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 text-xs text-stone-700 space-y-1">
              <p>
                <strong>Customer:</strong> {userToUnblock.name || "Customer"}
              </p>
              <p>
                <strong>Email:</strong> {userToUnblock.email}
              </p>
              <p className="text-[11px] text-emerald-700 pt-1 font-medium">
                Note: This customer will immediately regain full access to request appointments and use customer features.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToUnblock(null)}
                disabled={actionInProgressId === userToUnblock._id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUnblockUser(userToUnblock)}
                disabled={actionInProgressId === userToUnblock._id}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                {actionInProgressId === userToUnblock._id
                  ? "Unblocking..."
                  : "Yes, Unblock Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
