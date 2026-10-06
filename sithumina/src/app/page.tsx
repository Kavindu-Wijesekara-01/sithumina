"use client";

import React from "react";
import { BannerSlider } from "@/components/BannerSlider";
import { CTASection } from "@/components/CTASection";
import { LiveMap } from "@/components/LiveMap";

export default function HomePage() {
  return (
    <main
      className="p-3.5 lg:p-[18px_22px] flex flex-col gap-3 lg:gap-[14px] flex-1 min-h-0 w-full"
      id="main-content"
    >
      {/* Banner image slideshow with auto-play, pause on hover, fade transitions */}
      <BannerSlider />

      {/* Description paragraph + Action buttons */}
      <CTASection />

      {/* Interactive Sri Lanka Live Map Card with Lorry Markers & List */}
      <LiveMap />
    </main>
  );
}
