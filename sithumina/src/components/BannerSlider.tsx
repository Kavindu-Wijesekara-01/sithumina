"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { subscribeBanners } from "@/lib/db-services";

export interface BannerItem {
  id: string;
  image: string;
  mobileImage?: string;
  alt: string;
  href?: string;
}

interface BannerSliderProps {
  className?: string;
  autoPlayIntervalMs?: number;
  banners?: BannerItem[];
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: "sithumina-fleet-banner",
    image: "/banner-desktop.jpg?v=3",
    mobileImage: "/banner-mobile-2.jpg?v=3",
    alt: "Sithumina Transport – Lorry Fleet & Logistics – Call: 0755984984 / 0112984984",
    href: "tel:0755984984",
  },
  {
    id: "sithumina-travel-banner",
    image: "/banner.jpg?v=3",
    mobileImage: "/banner-mobile.jpg?v=3",
    alt: "Sithumina Transport – සිතුමිණ ට්‍රාන්ස්පෝර්ට් – Call for Booking 0755984984",
    href: "tel:0755984984",
  },
];

export const BannerSlider: React.FC<BannerSliderProps> = ({
  className = "",
  autoPlayIntervalMs = 5000,
  banners = DEFAULT_BANNERS,
}) => {
  const [activeBanners, setActiveBanners] = useState<BannerItem[]>(banners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = subscribeBanners((dbBanners) => {
      if (dbBanners && dbBanners.length > 0) {
        const mapped: BannerItem[] = dbBanners.map((b) => ({
          id: b.id,
          image: b.desktopImage || "/banner-desktop.jpg",
          mobileImage: b.mobileImage || b.desktopImage || "/banner-mobile-2.jpg",
          alt: b.title || "Sithumina Transport Promo",
          href: "tel:0755984984",
        }));
        setActiveBanners(mapped);
      }
    });
    return () => unsub();
  }, []);

  const slideCount = activeBanners.length;

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused || slideCount <= 1) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    timerRef.current = setInterval(nextSlide, autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide, autoPlayIntervalMs, slideCount]);

  if (slideCount === 0) return null;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <section
        aria-roledescription="carousel"
        aria-label="Promotional announcements"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        className="group relative w-full aspect-[3200/1312] lg:aspect-[1024/168] rounded-[14px] lg:rounded-[18px] overflow-hidden flex-none select-none shadow-sm border border-[#E7E2D0] bg-[#0c2444] transition-all"
      >
        {activeBanners.map((banner, index) => {
          const isActive = index === currentSlide;
          const mobileSrc = banner.mobileImage || banner.image;

          const content = (
            <div className="relative w-full h-full overflow-hidden">
              {/* Mobile View: 3200x1312 full aspect-ratio display */}
              <div className="block lg:hidden relative w-full h-full">
                <Image
                  src={mobileSrc}
                  alt={banner.alt}
                  fill
                  priority={index === 0}
                  unoptimized
                  sizes="(max-width: 1023px) 100vw, 800px"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  className="object-cover w-full h-full select-none"
                />
              </div>

              {/* Desktop View: 1024x167 ultra-wide banner display */}
              <div className="hidden lg:block relative w-full h-full">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  priority={index === 0}
                  unoptimized
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  className="object-cover w-full h-full select-none"
                />
              </div>
            </div>
          );

          return (
            <div
              key={banner.id || index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slideCount}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {banner.href ? (
                <a
                  href={banner.href}
                  className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC20E]"
                  aria-label={banner.alt}
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </div>
          );
        })}

        {/* Desktop Hover Arrows */}
        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous banner"
              className="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm border border-white/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next banner"
              className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-xs transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm border border-white/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </section>

      {/* Slide Navigation Dots (Subtle, small, centered at the bottom) */}
      {slideCount > 1 && (
        <div
          className="flex justify-center items-center gap-1.5 mt-1"
          role="tablist"
          aria-label="Slide dots"
        >
          {activeBanners.map((_, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-1 transition-all duration-300 border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FFC20E] ${
                  isActive
                    ? "w-3.5 rounded-full bg-[#FFC20E]"
                    : "w-1 rounded-full bg-[#26231B]/30 hover:bg-[#26231B]/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
