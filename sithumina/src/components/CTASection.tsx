"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface CTASectionProps {
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({ className = "" }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const [districts, setDistricts] = useState(0);
  const [trips, setTrips] = useState(0);
  const [rating, setRating] = useState("0.0");
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Honor prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDistricts(25);
      setTrips(500);
      setRating("4.8");
      return;
    }

    let animationFrameId: number;

    const startCounting = () => {
      const startTime = performance.now();
      const duration = 1400; // 1.4s smooth counter

      const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

      const updateFrame = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const factor = easeOutCubic(progress);

        setDistricts(Math.round(factor * 25));
        setTrips(Math.round(factor * 500));
        setRating((factor * 4.8).toFixed(1));

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(updateFrame);
        } else {
          setDistricts(25);
          setTrips(500);
          setRating("4.8");
        }
      };

      animationFrameId = requestAnimationFrame(updateFrame);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (!hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            startCounting();
          }
        } else {
          // When scrolled completely out of view, reset so scrolling back re-animates
          if (entry.intersectionRatio === 0 && hasAnimatedRef.current) {
            hasAnimatedRef.current = false;
            setDistricts(0);
            setTrips(0);
            setRating("0.0");
          }
        }
      },
      {
        threshold: [0, 0.2],
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const statsData = {
    districts: {
      value: districts,
      label: t.stats?.districtsLabel || "Districts covered",
    },
    trips: {
      value: trips,
      label: t.stats?.tripsLabel || "Trips completed",
    },
    rating: {
      value: rating,
      label: t.stats?.ratingLabel || "Customer rating",
    },
  };

  return (
    <section ref={containerRef} className={`w-full select-none ${className}`}>
      {/* DESKTOP CTA (≥1024px): Prominent Light Theme Number Board on left + 2 Action buttons on right */}
      <div className="hidden lg:grid grid-cols-[1fr_auto] gap-6 items-center p-[14px_24px] rounded-[16px] bg-gradient-to-r from-[#FFFDF5] via-white to-[#FFFDF5] border border-[#EADB9F] shadow-xs">
        {/* Left Stats Ribbon with 3 metrics and dividers */}
        <div className="grid grid-cols-3 items-center max-w-[560px]">
          {/* 1. Districts */}
          <div className="flex flex-col items-center justify-center text-center px-3 transition-transform duration-200 hover:scale-[1.03]">
            <span className="text-[26px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums">
              {statsData.districts.value}
            </span>
            <span className="text-[12px] font-semibold text-[#5A5445] mt-1.5 leading-tight">
              {statsData.districts.label}
            </span>
          </div>

          {/* 2. Trips */}
          <div className="flex flex-col items-center justify-center text-center px-3 border-x border-[#EADB9F] transition-transform duration-200 hover:scale-[1.03]">
            <span className="text-[26px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums">
              {statsData.trips.value}
              <span className="text-[#E5A100] text-[22px] font-extrabold">+</span>
            </span>
            <span className="text-[12px] font-semibold text-[#5A5445] mt-1.5 leading-tight">
              {statsData.trips.label}
            </span>
          </div>

          {/* 3. Rating */}
          <div className="flex flex-col items-center justify-center text-center px-3 transition-transform duration-200 hover:scale-[1.03]">
            <span className="text-[26px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums inline-flex items-center justify-center gap-1">
              {statsData.rating.value}
              <span className="text-[#E5A100] text-[22px] leading-none select-none">★</span>
            </span>
            <span className="text-[12px] font-semibold text-[#5A5445] mt-1.5 leading-tight">
              {statsData.rating.label}
            </span>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-[12px] flex-none">
          <Link
            href="/find-empty-lorry"
            className="border-0 font-bold text-[14px] py-[11px] px-[22px] rounded-[12px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="font-bold text-[14px] py-[11px] px-[22px] rounded-[12px] bg-[var(--card)] text-[var(--ink)] border-2 border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>

      {/* MOBILE CTA (<1024px): Prominent Number Board + 2 Action buttons underneath */}
      <div className="lg:hidden flex flex-col gap-2.5">
        {/* Stat Counter Card */}
        <div
          className="grid grid-cols-3 items-center py-3 px-2 rounded-[14px] bg-gradient-to-b from-[#FFFDF5] to-[#FDF9ED] border border-[#EADB9F] shadow-xs"
          role="region"
          aria-label="Service Statistics"
        >
          {/* 1. Districts */}
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[23px] sm:text-[25px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums">
              {statsData.districts.value}
            </span>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#5A5445] mt-1.5 leading-tight">
              {statsData.districts.label}
            </span>
          </div>

          {/* 2. Trips */}
          <div className="flex flex-col items-center justify-center text-center px-1 border-x border-[#EADB9F]">
            <span className="text-[23px] sm:text-[25px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums">
              {statsData.trips.value}
              <span className="text-[#E5A100] text-[21px] font-extrabold">+</span>
            </span>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#5A5445] mt-1.5 leading-tight">
              {statsData.trips.label}
            </span>
          </div>

          {/* 3. Customer rating */}
          <div className="flex flex-col items-center justify-center text-center px-1">
            <span className="text-[23px] sm:text-[25px] font-black text-[#E5A100] tracking-tight leading-none tabular-nums inline-flex items-center justify-center gap-0.5">
              {statsData.rating.value}
              <span className="text-[#E5A100] text-[19px] sm:text-[21px] leading-none select-none">★</span>
            </span>
            <span className="text-[11px] sm:text-[12px] font-medium text-[#5A5445] mt-1.5 leading-tight">
              {statsData.rating.label}
            </span>
          </div>
        </div>

        {/* Action buttons matching Image 2 */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/find-empty-lorry"
            className="text-center font-bold text-[12px] py-[10.5px] px-[6px] rounded-[10px] bg-[var(--y)] text-[#26231B] hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.findEmpty}
          </Link>
          <Link
            href="/book-vehicle"
            className="text-center font-bold text-[12px] py-[10.5px] px-[6px] rounded-[10px] bg-[var(--card)] text-[var(--ink)] border-[1.5px] border-[var(--y)] hover:bg-[var(--y3)] active:scale-[0.98] transition-all whitespace-nowrap truncate no-underline shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B]"
          >
            {t.buttons.bookVehicle}
          </Link>
        </div>
      </div>
    </section>
  );
};

