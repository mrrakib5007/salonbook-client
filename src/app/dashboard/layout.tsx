"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuChevronDown,
  LuChevronRight,
  LuHouse,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuUser,
  LuX,
} from "react-icons/lu";
import { authClient, useSession } from "@/lib/auth-client";
import Logo from "@/components/Shared/Logo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};
function useMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mounted = useMounted();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = session?.user;
  const userRole = (currentUser as { role?: string } | undefined)?.role || "user";
  const isAdmin = userRole === "admin";

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll on mobile when sidebar drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/sign-in");
          },
          onError: () => {
            toast.error("Failed to sign out");
            setIsLoggingOut(false);
          },
        },
      });
    } catch {
      toast.error("Error signing out");
      setIsLoggingOut(false);
    }
  };

  // Redirect Admin immediately to /admin-dashboard (Admins cannot access customer dashboard)
  useEffect(() => {
    if (!isPending && session?.user) {
      const isUserAdmin =
        (session.user as { role?: string })?.role === "admin";
      if (isUserAdmin) {
        router.replace("/admin-dashboard");
      }
    }
  }, [isPending, session, router]);

  const isRestricted = isPending || isAdmin;

  const navLinks = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LuLayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      name: "My Appointments",
      href: "/dashboard/my-appointments",
      icon: LuCalendar,
      active: pathname === "/dashboard/my-appointments",
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: LuUser,
      active: pathname === "/dashboard/profile",
    },
  ];

  return (
    <div
      suppressHydrationWarning
      className="relative h-screen overflow-hidden bg-stone-100/70 text-stone-900"
    >
      {/* Full-screen Loading / Redirect Overlay for isPending or isAdmin */}
      {isRestricted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-100/90 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-xs sm:text-sm font-medium text-stone-700">
              {isAdmin
                ? "Redirecting to Admin Portal..."
                : "Loading dashboard..."}
            </p>
          </div>
        </div>
      )}

      {/* Main Layout - always renders {children} so Next.js segment validation passes */}
      <div
        className={`flex h-screen overflow-hidden ${
          isRestricted ? "invisible pointer-events-none" : ""
        }`}
        aria-hidden={isRestricted}
      >
        {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => {
            setMobileMenuOpen(false);
            setIsProfileOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 max-w-[85vw] lg:w-60 shrink-0 flex-col justify-between border-r border-stone-200/80 bg-white px-4 py-5 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:h-screen ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col overflow-y-auto space-y-6 pr-1">
          {/* Logo & Close button */}
          <div className="flex items-center justify-between shrink-0">
            <Logo />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 lg:hidden cursor-pointer"
              aria-label="Close menu"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Customer Menu
            </p>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all ${
                      item.active
                        ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/25"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 ${
                          item.active
                            ? "text-white"
                            : "text-stone-400 group-hover:text-stone-700"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Platform Navigation */}
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Quick Links
            </p>
            <nav className="space-y-1">
              <Link
                href="/"
                className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <LuHouse className="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                <span>Back to Home</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="border-t border-stone-200/80 pt-4 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LuLogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>
            </div>
            <LuChevronRight className="h-4 w-4 text-rose-400" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header className="shrink-0 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen(false);
                setMobileMenuOpen(true);
              }}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden cursor-pointer"
              aria-label="Open sidebar"
            >
              <LuMenu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900">
                Customer Dashboard
              </h1>
              <p className="hidden text-xs text-stone-500 sm:block">
                Manage your salon appointment requests and bookings
              </p>
            </div>
          </div>

          {/* Top Bar Right: Profile Dropdown */}
          <div ref={profileDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsProfileOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 rounded-full p-1 transition hover:ring-2 hover:ring-stone-200 focus:outline-none cursor-pointer"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              {mounted && currentUser?.image ? (
                <Image
                  src={currentUser.image}
                  alt={currentUser.name || "Customer"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-primary/20"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-bold text-sm ring-2 ring-brand-primary/20">
                  {mounted && currentUser?.name
                    ? currentUser.name.charAt(0).toUpperCase()
                    : "U"}
                </div>
              )}
              <LuChevronDown
                className={`h-4 w-4 text-stone-400 transition-transform duration-150 ${
                  isProfileOpen ? "rotate-180 text-brand-primary" : ""
                }`}
              />
            </button>

            {/* Profile Popup Menu */}
            {isProfileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-stone-200/90 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* User Info Header */}
                <div className="border-b border-stone-100 px-3 py-2.5">
                  <p suppressHydrationWarning className="truncate text-sm font-semibold text-stone-900">
                    {mounted && currentUser?.name ? currentUser.name : "Customer"}
                  </p>
                  <p suppressHydrationWarning className="truncate text-xs text-stone-500">
                    {mounted && currentUser?.email ? currentUser.email : "customer@example.com"}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span className="inline-flex items-center rounded-md border border-brand-primary/20 bg-brand-light px-2 py-0.5 text-[11px] font-medium capitalize text-brand-primary">
                      Role: {userRole}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1.5 space-y-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                  >
                    <LuUser className="h-4 w-4 text-stone-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900"
                  >
                    <LuHouse className="h-4 w-4 text-stone-400" />
                    <span>Website Home</span>
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t border-stone-100 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                  >
                    <LuLogOut className="h-4 w-4 text-rose-500" />
                    <span>{isLoggingOut ? "Signing out..." : "Log Out"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body - Only this area scrolls vertically */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  </div>
  );
}
