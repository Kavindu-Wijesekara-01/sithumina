"use client";

import React from "react";
import { Lorry } from "@/lib/mock-lorries";
import { LorryStatusBadge } from "./LorryStatusBadge";
import { useLanguage } from "@/context/LanguageContext";

interface LorryListProps {
  lorries: Lorry[];
  selectedLorryId?: string | null;
  onSelectLorry?: (id: string) => void;
  className?: string;
}

export const LorryList: React.FC<LorryListProps> = ({
  lorries,
  selectedLorryId,
  onSelectLorry,
  className = "",
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`bg-[var(--card)] border-l border-[var(--line)] p-3 flex flex-col gap-2 overflow-y-auto select-none ${className}`}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-[var(--ink)] m-0">
          {t.map.nearbyTitle}
        </h4>
        <span className="text-[11px] font-semibold text-[var(--mut)]">
          {lorries.length} available
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {lorries.length === 0 ? (
          <div className="py-8 px-2 text-center text-[var(--mut)] text-[12px] flex flex-col items-center gap-1.5">
            <span className="text-2xl">🚛</span>
            <span className="font-bold text-[var(--ink)]">No Live Fleet Active</span>
            <span className="text-[11px] leading-tight text-center text-[var(--mut)]">
              Drivers registered via the Sithumina Driver App will appear here in real time.
            </span>
          </div>
        ) : (
          lorries.map((lorry) => {
            const isSelected = selectedLorryId === lorry.id;
            return (
              <div
                key={lorry.id}
                onClick={() => onSelectLorry?.(lorry.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectLorry?.(lorry.id);
                  }
                }}
                className={`flex items-center justify-between p-[9px_10px] border border-[var(--line)] rounded-[10px] text-[12px] cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[var(--y3)] border-[#FFC20E] ring-1 ring-[#FFC20E]"
                    : "bg-[var(--card)] hover:bg-[var(--y3)]"
                }`}
              >
                <div className="flex flex-col text-left">
                  <b className="text-[13px] font-extrabold text-[var(--ink)] leading-snug">
                    {lorry.plate}
                  </b>
                  <span className="text-[var(--mut)] font-medium text-[11.5px]">
                    {lorry.route}
                  </span>
                </div>
                <LorryStatusBadge status={lorry.status} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
