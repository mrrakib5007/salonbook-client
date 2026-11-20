"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  LuArrowRight,
  LuCheck,
  LuCircle,
  LuCloudUpload,
  LuEye,
  LuEyeOff,
  LuImage,
  LuLoader,
  LuLock,
  LuMail,
  LuUser,
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

interface SignUpErrors {
  fullName?: string;
  email?: string;
  image?: string;
  password?: string;
}

const NAME_REGEX = /^[a-zA-Z\s.'-]{2,50}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Profile image mode: "url" or "upload"
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");

  const [errors, setErrors] = useState<SignUpErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password rules per requirements.txt:
  // - Minimum 6 characters
  // - One uppercase letter
  // - One lowercase letter
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: SignUpErrors = {};

    // Validate Full Name
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = "Full name is required.";
    } else if (!NAME_REGEX.test(trimmedName)) {
      newErrors.fullName = "Please enter a valid name (at least 2 alphabetic letters).";
    }

    // Validate Email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
    }

    // Validate Profile Image
    if (imageMode === "url") {
      const trimmedUrl = imageUrl.trim();
      if (!trimmedUrl) {
        newErrors.image = "Profile image URL is required.";
      } else if (!URL_REGEX.test(trimmedUrl)) {
        newErrors.image = "Please enter a valid URL (starting with http:// or https://).";
      }
    } else {
      if (!selectedFile) {
        newErrors.image = "Please choose a profile image file to upload.";
      }
    }

    // Validate Password
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!hasMinLength || !hasUppercase || !hasLowercase) {
      newErrors.password =
        "Password must be at least 6 characters, contain 1 uppercase and 1 lowercase letter.";
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
      let finalImageUrl = "";

      if (imageMode === "url") {
        finalImageUrl = imageUrl.trim();
      } else if (selectedFile) {
        // Upload image via Express server API endpoint
        const serverUrl =
          process.env.NEXT_PUBLIC_SERVER_URL;
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadRes = await fetch(`${serverUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson?.success || !uploadJson?.url) {
          throw new Error(
            uploadJson?.message || "Failed to upload image. Please try again or use Image URL."
          );
        }
        finalImageUrl = uploadJson.url;
      }

      // Register user with Better Auth
      const res = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: fullName.trim(),
        image: finalImageUrl || undefined,
      });

      if (res.error) {
        toast.error(res.error.message || "Failed to create account. Please try again.");
        return;
      }

      console.log("Sign Up Submitted (JSON):", JSON.stringify(res.data, null, 2));
      toast.success("Account created successfully!");
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

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setIsGoogleLoading(false);
      toast.error("Google sign up failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-light/30">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-160 h-80 bg-brand-secondary/15 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-5 left-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg">
        {/* Card Container */}
        <div className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white/95 p-6 sm:p-9 shadow-xl backdrop-blur-xs">
          {/* Header */}
          <div className="text-center">
            <h1 className="font-fraunces text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              Create Your Account
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Join SalonBook to schedule and manage your luxury beauty treatments.
            </p>
          </div>

          {/* Registration Form */}
          <form noValidate onSubmit={handleSubmit} className="mt-7 space-y-4 sm:space-y-4.5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <LuUser className="text-base" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) {
                      setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }
                  }}
                  placeholder="e.g. Eleanor Vance"
                  className={`w-full rounded-2xl border bg-stone-50/40 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-3 ${
                    errors.fullName
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                      : "border-stone-200/90 focus:border-brand-primary focus:ring-brand-primary/15"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

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

            {/* Profile Image (Upload Image / Image URL) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Profile Image
                </label>

                {/* Mode Selector Tabs */}
                <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium text-stone-600">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("url");
                      if (errors.image) {
                        setErrors((prev) => ({ ...prev, image: undefined }));
                      }
                    }}
                    className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                      imageMode === "url"
                        ? "bg-white text-brand-primary shadow-2xs font-semibold"
                        : "hover:text-stone-900"
                    }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("upload");
                      if (errors.image) {
                        setErrors((prev) => ({ ...prev, image: undefined }));
                      }
                    }}
                    className={`rounded-md px-2.5 py-1 transition cursor-pointer ${
                      imageMode === "upload"
                        ? "bg-white text-brand-primary shadow-2xs font-semibold"
                        : "hover:text-stone-900"
                    }`}
                  >
                    Upload File
                  </button>
                </div>
              </div>

              {/* Mode: Image URL */}
              {imageMode === "url" ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                    <LuImage className="text-base" />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (errors.image) {
                        setErrors((prev) => ({ ...prev, image: undefined }));
                      }
                    }}
                    placeholder="https://example.com/avatar.jpg"
                    className={`w-full rounded-2xl border bg-stone-50/40 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 shadow-2xs transition focus:bg-white focus:outline-none focus:ring-3 ${
                      errors.image
                        ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-stone-200/90 focus:border-brand-primary focus:ring-brand-primary/15"
                    }`}
                  />
                </div>
              ) : (
                /* Mode: Upload Image */
                <label
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                    errors.image
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-stone-200 bg-stone-50/50 hover:border-brand-primary/40 hover:bg-brand-light/30"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <LuCloudUpload className="text-2xl text-brand-primary mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700">
                    {selectedFile ? selectedFile.name : "Click to browse or drag & drop"}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    PNG, JPG, or WEBP up to 5MB (via ImgBB)
                  </p>
                </label>
              )}

              {/* Error text if image is missing/invalid */}
              {errors.image && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">
                  {errors.image}
                </p>
              )}

              {/* Live Preview if available */}
              {(imageUrl || filePreview) && !errors.image && (
                <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-brand-light/50 p-2 border border-brand-primary/15">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-primary/20 bg-stone-100">
                    <Image
                      src={filePreview || imageUrl}
                      alt="Avatar Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-xs font-medium text-stone-600 truncate">
                    Photo ready to be set
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5"
              >
                Password
              </label>

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
                  placeholder="Create a strong password"
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

              {/* Password Rules Checklist per requirements.txt */}
              <div className="mt-2.5 rounded-xl bg-stone-50 p-3 border border-stone-100 space-y-1.5 text-xs">
                <p className="font-semibold text-stone-600 text-[11px] uppercase tracking-wider">
                  Password Requirements:
                </p>

                {/* Rule 1: Minimum 6 characters */}
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasMinLength ? "text-emerald-700 font-medium" : "text-stone-500"
                  }`}
                >
                  {hasMinLength ? (
                    <LuCheck className="text-emerald-600 text-sm shrink-0" />
                  ) : (
                    <LuCircle className="text-stone-300 text-xs shrink-0" />
                  )}
                  <span>At least 6 characters long</span>
                </div>

                {/* Rule 2: One uppercase letter */}
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasUppercase ? "text-emerald-700 font-medium" : "text-stone-500"
                  }`}
                >
                  {hasUppercase ? (
                    <LuCheck className="text-emerald-600 text-sm shrink-0" />
                  ) : (
                    <LuCircle className="text-stone-300 text-xs shrink-0" />
                  )}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>

                {/* Rule 3: One lowercase letter */}
                <div
                  className={`flex items-center gap-2 transition-colors ${
                    hasLowercase ? "text-emerald-700 font-medium" : "text-stone-500"
                  }`}
                >
                  {hasLowercase ? (
                    <LuCheck className="text-emerald-600 text-sm shrink-0" />
                  ) : (
                    <LuCircle className="text-stone-300 text-xs shrink-0" />
                  )}
                  <span>At least one lowercase letter (a-z)</span>
                </div>
              </div>
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
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
              Or register with
            </span>
          </div>

          {/* Google Social Sign Up - Under Submit Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Navigation Link */}
          <div className="mt-6 text-center border-t border-stone-100 pt-5">
            <p className="text-xs sm:text-sm text-stone-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-brand-primary hover:underline transition"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
