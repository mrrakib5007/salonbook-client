"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
  LuChevronDown,
  LuHouse,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuScissors,
  LuUser,
  LuX,
} from "react-icons/lu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: LuHouse },
  { label: "Browse Services", href: "/services", icon: LuScissors },
];

function DesktopNavLinkInner({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-full ${
        isActive
          ? "text-brand-primary bg-brand-primary/8"
          : "text-stone-600 hover:text-brand-primary hover:bg-brand-light"
      }`}
    >
      {item.label}
    </Link>
  );
}

function DesktopNavLink({ item }: { item: NavItem }) {
  return (
    <Suspense
      fallback={
        <Link
          href={item.href}
          className="relative px-3.5 py-2 text-sm font-medium text-stone-600 hover:text-brand-primary hover:bg-brand-light transition-colors duration-200 rounded-full"
        >
          {item.label}
        </Link>
      }
    >
      <DesktopNavLinkInner item={item} />
    </Suspense>
  );
}

function MobileNavLinkInner({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-brand-primary text-brand-light shadow-sm"
          : "text-stone-700 hover:bg-brand-light hover:text-brand-primary"
      }`}
    >
      <Icon
        className={`text-lg ${
          isActive ? "text-brand-secondary" : "text-brand-primary/75"
        }`}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Suspense
      fallback={
        <Link
          href={item.href}
          onClick={onNavigate}
          className="flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-brand-light hover:text-brand-primary transition-all duration-200"
        >
          <Icon className="text-lg text-brand-primary/75" />
          <span>{item.label}</span>
        </Link>
      }
    >
      <MobileNavLinkInner item={item} onNavigate={onNavigate} />
    </Suspense>
  );
}

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Static UI state only — replace with actual auth state when integrating authentication
  const isLoggedIn = false;
  const mockUser = {
    name: "Guest User",
    email: "customer@salonbook.com",
  };

  const navItems: NavItem[] = isLoggedIn
    ? [
        ...PUBLIC_NAV_ITEMS,
        { label: "Dashboard", href: "/dashboard", icon: LuLayoutDashboard },
      ]
    : PUBLIC_NAV_ITEMS;

  // Close dropdown on outside click and close overlays on Escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scrolling when mobile right-side slider is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-brand-primary/10 bg-white/90 backdrop-blur-md">
        <nav
          aria-label="Main Navigation"
          className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Left: Brand Logo */}
          <Logo />

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {navItems.map((item) => (
              <DesktopNavLink key={item.href} item={item} />
            ))}
          </div>

          {/* Right: Desktop Auth Actions / Profile Dropdown */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2.5 rounded-full border border-brand-primary/15 bg-brand-light/70 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-stone-800 transition hover:border-brand-primary/30 hover:bg-brand-light cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-brand-light">
                    <LuUser className="text-sm" />
                  </span>
                  <span className="max-w-32 truncate">{mockUser.name}</span>
                  <LuChevronDown
                    className={`text-stone-500 transition-transform duration-200 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-2xl border border-brand-primary/10 bg-white p-2 shadow-xl"
                  >
                    <div className="border-b border-stone-100 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-stone-900">
                        {mockUser.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {mockUser.email}
                      </p>
                    </div>

                    <div className="py-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-brand-light hover:text-brand-primary"
                      >
                        <LuLayoutDashboard className="text-base text-brand-primary" />
                        <span>Dashboard</span>
                      </Link>
                    </div>

                    <div className="border-t border-stone-100 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 cursor-pointer"
                      >
                        <LuLogOut className="text-base" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-brand-light hover:text-brand-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-medium text-brand-light shadow-sm transition-all duration-200 hover:bg-brand-primary/90 hover:shadow"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-primary/15 bg-brand-light/70 text-stone-800 transition hover:border-brand-primary/30 hover:text-brand-primary cursor-pointer"
            >
              <LuMenu className="text-xl" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Backdrop Overlay */}
      <div
        onClick={closeMobileMenu}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      {/* Mobile Right-Side Slider Drawer */}
      <aside
        aria-label="Mobile Navigation Drawer"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed top-0 right-0 z-50 flex h-dvh w-[84%] max-w-85 flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Slider Header */}
        <div className="flex items-center justify-between border-b border-brand-primary/10 bg-brand-light/60 px-5 py-4">
          <Logo onClick={closeMobileMenu} />
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-primary/15 bg-white text-stone-700 transition hover:border-brand-primary/30 hover:text-brand-primary cursor-pointer"
          >
            <LuX className="text-lg" />
          </button>
        </div>

        {/* Optional Authenticated User Summary inside Mobile Slider */}
        {isLoggedIn && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-brand-primary/10 bg-brand-light p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-brand-light">
              <LuUser className="text-lg" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">
                {mockUser.name}
              </p>
              <p className="truncate text-xs text-stone-500">
                {mockUser.email}
              </p>
            </div>
          </div>
        )}

        {/* Slider Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-2.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Navigation
          </p>
          <div className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <MobileNavLink
                key={item.href}
                item={item}
                onNavigate={closeMobileMenu}
              />
            ))}
          </div>
        </div>

        {/* Slider Bottom Actions */}
        <div className="border-t border-brand-primary/10 bg-brand-light/40 p-5">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={closeMobileMenu}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-100 cursor-pointer"
            >
              <LuLogOut className="text-base" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/sign-in"
                onClick={closeMobileMenu}
                className="flex w-full items-center justify-center rounded-xl border border-brand-primary/25 bg-white px-4 py-2.5 text-sm font-medium text-brand-primary transition hover:bg-brand-light"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={closeMobileMenu}
                className="flex w-full items-center justify-center rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-brand-light shadow-sm transition hover:bg-brand-primary/90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
