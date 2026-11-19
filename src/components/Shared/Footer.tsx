"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  LuClock,
  LuFacebook,
  LuInstagram,
  LuLinkedin,
  LuMail,
  LuMapPin,
  LuPhone,
  LuTwitter,
  LuYoutube,
} from "react-icons/lu";

const emptySubscribe = () => () => {};

const Footer = () => {
  const currentYear = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026
  );

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Services", href: "/services" },
    { label: "Haircut & Styling", href: "/services" },
    { label: "Facial & Skincare", href: "/services" },
    { label: "Spa & Massage", href: "/services" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: LuFacebook },
    { name: "Instagram", href: "https://instagram.com", icon: LuInstagram },
    { name: "Twitter", href: "https://twitter.com", icon: LuTwitter },
    { name: "YouTube", href: "https://youtube.com", icon: LuYoutube },
    { name: "LinkedIn", href: "https://linkedin.com", icon: LuLinkedin },
  ];

  return (
    <footer className="w-full bg-[#1e0a14] text-stone-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Logo & Short Description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5 focus:outline-none"
            >
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary shadow-sm transition-transform duration-200 group-hover:scale-105">
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <path
                    d="M13 8L20 20.5L27 8"
                    stroke="#fbf7f4"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 20.5L14.2 29.2"
                    stroke="#fbf7f4"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20.5L25.8 29.2"
                    stroke="#fbf7f4"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="31.5"
                    r="3.5"
                    stroke="#fbf7f4"
                    strokeWidth="2.4"
                  />
                  <circle
                    cx="28"
                    cy="31.5"
                    r="3.5"
                    stroke="#fbf7f4"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M17.8 32L19.4 33.6L22.5 30.2"
                    stroke="#d98aa6"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-fraunces text-2xl font-semibold tracking-tight text-white">
                Salon<span className="text-brand-secondary">Book</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-stone-400">
              Your premier salon appointment booking platform. Explore expert
              services, choose your preferred time slot, and treat yourself to a
              refreshing beauty experience with ease.
            </p>

            {/* Social Media Links */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Follow Us
              </p>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-secondary/40 hover:bg-brand-primary hover:text-white"
                    >
                      <Icon className="text-base" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Important Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-fraunces text-lg font-semibold text-white">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-stone-400 transition-colors duration-200 hover:text-brand-secondary hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Salon Address & Opening Hours */}
          <div className="space-y-4">
            <h3 className="font-fraunces text-lg font-semibold text-white">
              Opening Hours
            </h3>

            {/* Address */}
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <LuMapPin className="mt-0.5 shrink-0 text-base text-brand-secondary" />
              <span>124 Beauty Boulevard, Suite 400, New York, NY 10001</span>
            </div>

            {/* Hours list */}
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <LuClock className="mt-0.5 shrink-0 text-base text-brand-secondary" />
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-stone-300">Mon - Fri:</span>
                  <span>9:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-300">Saturday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-stone-300">Sunday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Salon Contact Information */}
          <div className="space-y-4">
            <h3 className="font-fraunces text-lg font-semibold text-white">
              Contact Info
            </h3>

            <p className="text-sm text-stone-400">
              Have questions or need assistance with your booking? Reach out to
              our friendly salon team.
            </p>

            <div className="space-y-3 text-sm">
              <a
                href="tel:+15552345678"
                className="group flex items-center gap-3 text-stone-400 transition-colors hover:text-brand-secondary"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-brand-secondary transition group-hover:bg-brand-primary group-hover:text-white">
                  <LuPhone className="text-sm" />
                </span>
                <span>+1 (555) 234-5678</span>
              </a>

              <a
                href="mailto:support@salonbook.com"
                className="group flex items-center gap-3 text-stone-400 transition-colors hover:text-brand-secondary"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-brand-secondary transition group-hover:bg-brand-primary group-hover:text-white">
                  <LuMail className="text-sm" />
                </span>
                <span>support@salonbook.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright Information */}
      <div className="border-t border-white/10 bg-[#17070f]/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-stone-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {currentYear} <span className="text-stone-200">SalonBook</span>. All
            rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="transition-colors hover:text-brand-secondary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-brand-secondary"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="transition-colors hover:text-brand-secondary"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
