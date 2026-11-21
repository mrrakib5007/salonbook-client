"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LuCalendar,
  LuCamera,
  LuCircleAlert,
  LuImage,
  LuLink,
  LuLoader,
  LuMail,
  LuPhone,
  LuRotateCcw,
  LuSave,
  LuUpload,
  LuUser,
} from "react-icons/lu";
import { authClient, useSession } from "@/lib/auth-client";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image: string;
  phone?: string;
  createdAt: string | null;
}

// Helper to fetch session token for cross-domain headers
async function getAuthHeaders(): Promise<Record<string, string>> {
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
}

export default function MyProfilePage() {
  const { data: session } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Form states
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [phone, setPhone] = useState("");

  // Image input mode: 'upload' or 'url'
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000",
    []
  );

  // Fetch profile on mount or retry
  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${serverUrl}/api/user/profile`, {
          credentials: "include",
          headers: authHeaders,
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("You must be signed in to view your profile.");
          }
          throw new Error("Failed to load profile details.");
        }

        const data = await res.json();
        if (ignore) return;
        if (data.success && data.user) {
          const u = data.user;
          setProfile(u);
          setName(u.name || "");
          setImage(u.image || "");
          setPhone(u.phone || "");
          setFilePreview(null);
          setSelectedFile(null);
          setFetchError(null);
        } else {
          throw new Error(data.message || "Failed to load profile details.");
        }
      } catch (err: unknown) {
        if (ignore) return;
        const msg =
          err instanceof Error ? err.message : "Error loading profile details";
        setFetchError(msg);
        if (session?.user) {
          setName(session.user.name || "");
          setImage(session.user.image || "");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [serverUrl, retryTrigger, session]);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  };

  // Upload image to ImgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const authHeaders = await getAuthHeaders();
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${serverUrl}/api/upload`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.message || "Failed to upload image to server.");
      }

      return data.url;
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Check if form has unsaved modifications
  const isDirty = Boolean(
    profile &&
      (name.trim() !== (profile.name || "").trim() ||
        phone.trim() !== (profile.phone || "").trim() ||
        image.trim() !== (profile.image || "").trim() ||
        selectedFile !== null)
  );

  // Reset form to saved state
  const handleReset = () => {
    if (!profile) return;
    setName(profile.name || "");
    setImage(profile.image || "");
    setPhone(profile.phone || "");
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast("Form reset to saved profile information", { icon: "↩️" });
  };

  // Handle Profile Update Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = image.trim();

      // If user picked a file in upload mode, upload it first
      if (imageMode === "upload" && selectedFile) {
        const uploadToast = toast.loading("Uploading profile image...");
        try {
          finalImageUrl = await uploadImageToImgBB(selectedFile);
          setImage(finalImageUrl);
          toast.success("Image uploaded successfully!", { id: uploadToast });
        } catch (uploadErr: unknown) {
          const uploadMsg =
            uploadErr instanceof Error
              ? uploadErr.message
              : "Failed to upload image";
          toast.error(uploadMsg, { id: uploadToast });
          setIsSaving(false);
          return;
        }
      }

      const authHeaders = await getAuthHeaders();
      const payload = {
        name: name.trim(),
        image: finalImageUrl,
        phone: phone.trim(),
      };

      const res = await fetch(`${serverUrl}/api/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile.");
      }

      // Sync Better-Auth session on client
      try {
        await authClient.updateUser({
          name: name.trim(),
          image: finalImageUrl || undefined,
        });
      } catch {
        // Non-blocking sync
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: data.user?.name || prev.name,
              image: data.user?.image || prev.image,
              phone: data.user?.phone || prev.phone,
            }
          : null
      );
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(data.message || "Profile updated successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error updating profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar display
  const currentAvatar = filePreview || image || profile?.image || "";
  const displayInitials = (name || profile?.name || "U")
    .charAt(0)
    .toUpperCase();

  // Formatted registration date
  let formattedJoinDate = "Joined Recently";
  if (profile?.createdAt) {
    try {
      const d = new Date(profile.createdAt);
      formattedJoinDate = d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      formattedJoinDate = "Joined Recently";
    }
  }

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-stone-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your profile photo, name, and contact information.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-stone-200" />
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="h-6 w-48 bg-stone-200 rounded-md mx-auto sm:mx-0" />
              <div className="h-4 w-64 bg-stone-100 rounded-md mx-auto sm:mx-0" />
              <div className="h-4 w-32 bg-stone-100 rounded-md mx-auto sm:mx-0" />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="h-12 bg-stone-100 rounded-xl" />
            <div className="h-12 bg-stone-100 rounded-xl" />
            <div className="h-12 bg-stone-100 rounded-xl" />
          </div>
        </div>
      )}

      {/* Fetch Error State */}
      {!loading && fetchError && !profile && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 text-center text-rose-800">
          <LuCircleAlert className="mx-auto h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-semibold">Failed to load profile</h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1">{fetchError}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRetryTrigger((prev) => prev + 1);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary/90 transition cursor-pointer"
          >
            <LuRotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Main Profile Content */}
      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Overview Card */}
          <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              {/* Profile Photo */}
              <div className="relative shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-brand-primary/15 shadow-md bg-stone-100">
                  {currentAvatar ? (
                    <Image
                      src={currentAvatar}
                      alt={name || "Profile Photo"}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-primary/10 text-brand-primary font-fraunces text-3xl font-bold">
                      {displayInitials}
                    </div>
                  )}
                </div>

                {/* Camera upload button */}
                <button
                  type="button"
                  onClick={() => {
                    setImageMode("upload");
                    fileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-md hover:bg-brand-primary/90 hover:scale-105 transition cursor-pointer"
                  title="Upload profile photo"
                >
                  <LuCamera className="h-4 w-4" />
                </button>
              </div>

              {/* Identity Details */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold font-fraunces text-stone-900">
                  {name || profile?.name || "Customer"}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <LuMail className="h-3.5 w-3.5 text-stone-400" />
                  <span>
                    {profile?.email || session?.user?.email || "customer@example.com"}
                  </span>
                </p>
                <p className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <LuCalendar className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Member since {formattedJoinDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Edit Profile Details Card */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-stone-900 border-b border-stone-100 pb-3">
              Edit Profile Information
            </h3>

            {/* Profile Photo Upload / URL Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <LuImage className="h-3.5 w-3.5 text-brand-primary" />
                  <span>Profile Photo</span>
                </label>

                {/* Upload or URL Switcher Tabs */}
                <div className="flex rounded-lg bg-stone-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode("upload")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                      imageMode === "upload"
                        ? "bg-white text-brand-primary shadow-xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <LuUpload className="h-3 w-3" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode("url")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition cursor-pointer ${
                      imageMode === "url"
                        ? "bg-white text-brand-primary shadow-xs"
                        : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    <LuLink className="h-3 w-3" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {imageMode === "upload" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="single-profile-image"
                  />
                  <label
                    htmlFor="single-profile-image"
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-4 text-center hover:border-brand-primary/40 hover:bg-brand-primary/5 transition cursor-pointer"
                  >
                    <LuUpload className="h-5 w-5 text-brand-primary mb-1" />
                    <p className="text-xs font-semibold text-stone-700">
                      {selectedFile
                        ? `Selected: ${selectedFile.name}`
                        : "Choose image file (PNG, JPG, WEBP max 5MB)"}
                    </p>
                  </label>
                  {selectedFile && (
                    <div className="flex items-center justify-between mt-2 rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-1.5 text-xs text-amber-800">
                      <span>Image selected. Click <strong>Save Changes</strong> to apply.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <LuLink className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="user-name"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LuUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  id="user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label
                htmlFor="user-email"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  id="user-email"
                  type="email"
                  disabled
                  value={profile?.email || session?.user?.email || ""}
                  className="w-full rounded-xl border border-stone-200 bg-stone-100/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label
                htmlFor="user-phone"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Phone Number <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <LuPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  id="user-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1712 345678"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-900 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={!isDirty || isSaving || isUploadingImage}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <LuRotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={!isDirty || isSaving || isUploadingImage}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {isSaving || isUploadingImage ? (
                  <>
                    <LuLoader className="h-4 w-4 animate-spin" />
                    <span>{isUploadingImage ? "Uploading..." : "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <LuSave className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
