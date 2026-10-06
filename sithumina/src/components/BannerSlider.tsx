"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface BannerSliderProps {
  className?: string;
  autoPlayIntervalMs?: number;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
  className = "",
  autoPlayIntervalMs = 4000,
}) => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides = t.slides;
  const slideCount = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (isPaused) return;

    // Check if prefers-reduced-motion is active
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
  }, [isPaused, nextSlide, autoPlayIntervalMs]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Promotional announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`relative w-full h-[150px] lg:h-[190px] rounded-[16px] overflow-hidden flex-none select-none shadow-xs ${className}`}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slideCount}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 p-4 lg:p-[24px_28px] flex flex-col justify-center text-[#26231B] transition-opacity duration-600 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
            style={{ backgroundColor: slide.bg }}
          >
            <b className="text-[19px] lg:text-[26px] leading-[1.15] max-w-[340px] lg:max-w-[420px] font-extrabold tracking-tight">
              {slide.title}
            </b>
            <span className="mt-1.5 lg:mt-2 text-[12px] lg:text-[14px] max-w-[300px] lg:max-w-[380px] font-medium opacity-90">
              {slide.subtitle}
            </span>
            <div
              className="absolute right-3.5 lg:right-[28px] bottom-3 lg:bottom-[14px] text-[48px] lg:text-[70px] opacity-90 select-none pointer-events-none"
              aria-hidden="true"
            >
              {slide.emoji}
            </div>
          </div>
        );
      })}

      {/* Slide Navigation Dots */}
      <div
        className="absolute left-4 lg:left-[28px] bottom-3 lg:bottom-[12px] flex items-center gap-1.5 z-20"
        role="tablist"
        aria-label="Slide dots"
      >
        {slides.map((_, index) => {
          const isActive = index === currentSlide;
          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 transition-all duration-300 border-0 p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#26231B] ${
                isActive
                  ? "w-[22px] rounded-[6px] bg-[#26231B]"
                  : "w-2 rounded-full bg-[rgba(38,35,27,0.3)] hover:bg-[rgba(38,35,27,0.5)]"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
};
