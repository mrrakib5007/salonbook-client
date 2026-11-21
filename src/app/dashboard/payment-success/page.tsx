"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    router.replace(`/payment-success${query}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent mb-3" />
      <p className="text-xs sm:text-sm font-medium text-stone-700">Redirecting to receipt...</p>
    </div>
  );
}

export default function DashboardPaymentSuccessRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
