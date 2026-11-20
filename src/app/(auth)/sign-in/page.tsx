"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  LuArrowRight,
  LuEye,
  LuEyeOff,
  LuLoader,
  LuLock,
  LuMail,
} from "react-icons/lu";
import { authClient } from "@/lib/auth-client";

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface SignInErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: SignInErrors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res.error) {
        toast.error(res.error.message || "Invalid email or password.");
        return;
      }

      console.log("Sign In Submitted (JSON):", JSON.stringify(res.data, null, 2));
      toast.success("Signed in successfully!");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setIsGoogleLoading(false);
      toast.error("Google sign in failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light/30">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-140 h-70 bg-brand-secondary/15 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 p-6 sm:p-9 shadow-xl backdrop-blur-xs">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-fraunces text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Sign in with your credentials to manage appointments and access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4 sm:space-y-4.5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <LuMail className="text-base" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="you@example.com"
                  className={`w-full rounded-2xl border bg-stone-50/40 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-3 ${
                    errors.email
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                      : "border-stone-200/90 focus:border-brand-primary focus:ring-brand-primary/15"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-primary hover:underline transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <LuLock className="text-base" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full rounded-2xl border bg-stone-50/40 py-3 pl-10 pr-10 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-3 ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                      : "border-stone-200/90 focus:border-brand-primary focus:ring-brand-primary/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <LuEyeOff className="text-base" />
                  ) : (
                    <LuEye className="text-base" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-brand-primary focus:ring-brand-primary/30 accent-brand-primary cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-600">
                  Remember me on this device
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-3.5 px-4 text-sm font-semibold text-white shadow-md shadow-brand-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary/90 hover:shadow-lg focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LuLoader className="text-base animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LuArrowRight className="text-base" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-stone-200/80" />
            <span className="absolute bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Or continue with
            </span>
          </div>

          {/* Google Social Sign In Button - Under Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200/90 bg-white py-3 px-4 text-sm font-semibold text-stone-700 shadow-2xs transition-all duration-200 hover:border-stone-300 hover:bg-stone-50 hover:shadow-xs focus:outline-none cursor-pointer disabled:opacity-70"
            >
              {isGoogleLoading ? (
                <>
                  <LuLoader className="text-base animate-spin text-stone-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Navigation Link */}
          <div className="mt-6 text-center border-t border-stone-100 pt-5">
            <p className="text-xs sm:text-sm text-stone-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-brand-primary hover:underline transition"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
