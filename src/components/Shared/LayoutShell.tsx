"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Shared/Navbar";
import Footer from "@/components/Shared/Footer";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin-dashboard");

  if (isDashboard) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="flex-1">{children}</main>}>
      <ShellContent>{children}</ShellContent>
    </Suspense>
  );
}
