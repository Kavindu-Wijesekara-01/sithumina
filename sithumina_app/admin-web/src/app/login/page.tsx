"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setClientSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = loginId.trim();

    if (trimmed.length < 3) {
      setErrorMessage("Please enter at least 3 characters");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    // Save session in cookie
    setClientSession(trimmed);

    // Redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FFC20E] flex items-center justify-center p-6 overflow-hidden select-none">
      {/* Decorative Organic Circles matching prototype */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-[360px] h-[360px] rounded-full bg-[rgba(235,160,0,0.35)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-[32%] -right-24 w-[280px] h-[280px] rounded-full bg-[rgba(235,160,0,0.22)] pointer-events-none"
      />

      {/* Decorative Dashed Road Line matching prototype */}
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-10 -right-10 h-[200px] border-t-[3px] border-dashed border-[rgba(185,125,0,0.55)] rounded-t-[50%] bg-[rgba(240,165,0,0.22)] pointer-events-none"
      />

      {/* Main Content Card */}
      <main className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
        {/* Transparent Logo - never on a white box */}
        <div className="mb-4 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Sithumina Transport"
            width={160}
            height={120}
            priority
            className="object-contain max-h-[120px] w-auto drop-shadow-sm"
          />
        </div>

        {/* Company Name in Brand Red */}
        <h1 className="text-[28px] font-[900] text-[#B3121F] tracking-tight mb-2 text-center">
          Sithumina Transport
        </h1>

        {/* Tag Pill */}
        <div className="bg-[rgba(230,155,0,0.55)] px-5 py-1.5 rounded-pill text-[13px] font-[800] text-[#1F1E1B] mb-9 shadow-sm">
          Riders & Admin
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
          <div className="relative flex items-center">
            <span
              aria-hidden="true"
              className="absolute left-[18px] text-[19px] pointer-events-none"
            >
              🪪
            </span>
            <input
              type="text"
              id="loginId"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter your ID"
              aria-label="Enter your ID"
              autoComplete="username"
              disabled={loading}
              className="w-full h-[60px] bg-[#FED857] border-[1.5px] border-[#E5AA0E] rounded-[24px] pl-[52px] pr-5 text-[16px] font-[600] text-[#1F1E1B] placeholder-[#7D5E06] shadow-sm outline-none focus-visible:border-[#1F1E1B] focus-visible:outline-[3px] focus-visible:outline-[#1F1E1B] focus-visible:outline-offset-2 transition-colors"
            />
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="bg-[rgba(31,30,27,0.85)] text-[#FED857] text-[12.5px] font-[700] py-2 px-3.5 rounded-[12px] text-center"
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[60px] bg-[#1F1E1B] text-[#FFC20E] rounded-[24px] font-[800] text-[18px] flex items-center justify-center gap-2 shadow-[0_6px_14px_rgba(0,0,0,0.2)] hover:opacity-95 active:scale-[0.98] focus-visible:outline-[3px] focus-visible:outline-[#1F1E1B] focus-visible:outline-offset-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Login</span>
                <span aria-hidden="true">➔</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
