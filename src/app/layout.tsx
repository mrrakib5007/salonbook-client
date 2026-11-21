import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutShell from "@/components/Shared/LayoutShell";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalonBook - Salon Appointment Booking Platform",
  description: "Book appointments at your favorite salon with ease.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className={`${poppins.className} min-h-full flex flex-col bg-stone-50/50`}>
        <Toaster />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
