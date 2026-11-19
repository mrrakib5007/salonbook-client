import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  variant?: "light" | "dark"; // "light" for light backgrounds (Navbar), "dark" for dark backgrounds (Footer)
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  onClick,
  variant = "light",
  size = "md",
  showText = true,
  href = "/",
}) => {
  // Size classes
  const sizeConfig = {
    sm: {
      dimension: 32,
      badge: "h-8 w-8",
      text: "text-lg sm:text-xl",
    },
    md: {
      dimension: 40,
      badge: "h-10 w-10",
      text: "text-xl sm:text-2xl",
    },
    lg: {
      dimension: 48,
      badge: "h-12 w-12",
      text: "text-2xl sm:text-3xl",
    },
  }[size];

  // Variant color styles (No hover scale or transform effect per user requirement)
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 focus:outline-none ${className}`}
    >
      {/* Brand Icon Image from public/logo.png */}
      <span
        className={`relative flex ${sizeConfig.badge} shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs`}
      >
        <Image
          src="/logo.png"
          alt="SalonBook Logo"
          width={sizeConfig.dimension}
          height={sizeConfig.dimension}
          className="h-full w-full object-cover"
          priority
        />
      </span>

      {/* Brand Text */}
      {showText && (
        <span
          className={`font-fraunces ${sizeConfig.text} font-semibold tracking-tight ${
            isDark ? "text-white" : "text-stone-900"
          }`}
        >
          Salon
          <span className={isDark ? "text-brand-secondary" : "text-brand-primary"}>
            Book
          </span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
