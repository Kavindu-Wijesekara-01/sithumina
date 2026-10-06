"use client";

import React from "react";
import { LorryStatus } from "@/lib/mock-lorries";
import { useLanguage } from "@/context/LanguageContext";

interface LorryStatusBadgeProps {
  status: LorryStatus;
  className?: string;
}

export const LorryStatusBadge: React.FC<LorryStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const { t } = useLanguage();

  if (status === "empty") {
    return (
      <span
        className={`font-extrabold text-[11px] px-2 py-[3px] rounded-full bg-[#FFE08A] text-[#5B4300] tracking-tight select-none ${className}`}
      >
        {t.map.status.empty}
      </span>
    );
  }

  return (
    <span
      className={`font-extrabold text-[11px] px-2 py-[3px] rounded-full bg-[#DDF3E7] text-[#12663A] tracking-tight select-none ${className}`}
    >
      {t.map.status.onTrip}
    </span>
  );
};
