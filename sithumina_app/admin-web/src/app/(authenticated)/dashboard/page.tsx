"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useToast } from "@/components/ui/Toast";

// Dynamic map preview for Sri Lanka
const LiveLeafletMap = dynamic(() => import("@/components/map/LiveLeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] bg-[#EFECE1] rounded-xl flex items-center justify-center">
      <span className="text-muted text-[12px] font-bold">Loading Sri Lanka Map...</span>
    </div>
  ),
});

const DASHBOARD_LORRIES: any[] = [];

const WEEKLY_REVENUE = [
  { day: "Mon", val: 0 },
  { day: "Tue", val: 0 },
  { day: "Wed", val: 0 },
  { day: "Thu", val: 0 },
  { day: "Fri", val: 0 },
  { day: "Sat", val: 0, max: true },
  { day: "Sun", val: 0 },
];

interface RequestItem {
  id: number;
  customer: string;
  from: string;
  to: string;
  load: string;
  vehicle: string;
  status: "p" | "a" | "r";
}

const INITIAL_REQUESTS: RequestItem[] = [];

const REVIEWS: any[] = [];

export default function DashboardPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);

  const pendingRequests = requests.filter((r) => r.status === "p");

  const handleAction = (id: number, status: "a" | "r") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(status === "a" ? "Request approved" : "Request rejected");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 4 Clickable KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Live Lorries -> Links to /live-map */}
        <Link
          href="/live-map"
          className="bg-card border border-line rounded-card p-4 shadow-card hover:border-primary hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-muted text-[12px] font-bold">
            <span className="w-8 h-8 rounded-[10px] bg-primary text-ink flex items-center justify-center shrink-0 text-[14px] group-hover:scale-105 transition-transform">
              🚚
            </span>
            <span className="group-hover:text-ink transition-colors">Live lorries</span>
          </div>
          <div className="text-[26px] font-[800] text-ink leading-tight">{DASHBOARD_LORRIES.length}</div>
          <div className="text-[12px] font-bold text-muted flex items-center justify-between">
            <span>{DASHBOARD_LORRIES.length > 0 ? `${DASHBOARD_LORRIES.length} online` : "No lorries live"}</span>
            <span className="text-[11px] text-muted group-hover:text-ink">View map →</span>
          </div>
        </Link>

        {/* KPI 2: Pending Requests -> Links to /requests */}
        <Link
          href="/requests"
          className="bg-card border border-line rounded-card p-4 shadow-card hover:border-primary hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-muted text-[12px] font-bold">
            <span className="w-8 h-8 rounded-[10px] bg-primary text-ink flex items-center justify-center shrink-0 text-[14px] group-hover:scale-105 transition-transform">
              📋
            </span>
            <span className="group-hover:text-ink transition-colors">Pending requests</span>
          </div>
          <div className="text-[26px] font-[800] text-ink leading-tight">
            {pendingRequests.length}
          </div>
          <div className="text-[12px] font-bold text-[#B3121F] flex items-center justify-between">
            <span>{pendingRequests.length > 0 ? "Needs action" : "All cleared"}</span>
            <span className="text-[11px] text-muted group-hover:text-ink">Manage →</span>
          </div>
        </Link>

        {/* KPI 3: Active Riders -> Links to /riders */}
        <Link
          href="/riders"
          className="bg-card border border-line rounded-card p-4 shadow-card hover:border-primary hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-muted text-[12px] font-bold">
            <span className="w-8 h-8 rounded-[10px] bg-primary text-ink flex items-center justify-center shrink-0 text-[14px] group-hover:scale-105 transition-transform">
              👤
            </span>
            <span className="group-hover:text-ink transition-colors">Active riders</span>
          </div>
          <div className="text-[26px] font-[800] text-ink leading-tight">1</div>
          <div className="text-[12px] font-bold text-ok flex items-center justify-between">
            <span>R-1001 active</span>
            <span className="text-[11px] text-muted group-hover:text-ink">View all →</span>
          </div>
        </Link>

        {/* KPI 4: Revenue Today -> Links to /revenue */}
        <Link
          href="/revenue"
          className="bg-card border border-line rounded-card p-4 shadow-card hover:border-primary hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-muted text-[12px] font-bold">
            <span className="w-8 h-8 rounded-[10px] bg-primary text-ink flex items-center justify-center shrink-0 text-[14px] group-hover:scale-105 transition-transform">
              💰
            </span>
            <span className="group-hover:text-ink transition-colors">Revenue today</span>
          </div>
          <div className="text-[26px] font-[800] text-ink leading-tight">LKR 0</div>
          <div className="text-[12px] font-bold text-muted flex items-center justify-between">
            <span>0 trips completed</span>
            <span className="text-[11px] text-muted group-hover:text-ink">Reports →</span>
          </div>
        </Link>
      </div>

      {/* Row 2: Revenue this week + Mini Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Revenue Chart Card */}
        <div className="bg-card border border-line rounded-card p-4 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-[800] text-ink">Revenue this week</h3>
            <Link href="/revenue" className="text-[12px] font-bold text-muted hover:text-ink">
              View all
            </Link>
          </div>

          <div className="flex items-end gap-2 h-[190px] pt-2">
            {WEEKLY_REVENUE.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 text-[11px] font-bold text-muted">
                <span>{item.val}K</span>
                <div
                  style={{ height: `${(item.val / 88) * 130}px` }}
                  className={`w-full max-w-[38px] rounded-t-[8px] rounded-b-[4px] transition-all ${
                    item.max ? "bg-primary" : "bg-[#FFE08A]"
                  }`}
                />
                <span>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Map Preview Card */}
        <div className="bg-card border border-line rounded-card p-4 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-[800] text-ink">Live map</h3>
            <Link href="/live-map" className="text-[12px] font-bold text-muted hover:text-ink">
              Open
            </Link>
          </div>

          <div className="w-full h-[220px] rounded-xl overflow-hidden relative">
            <LiveLeafletMap
              lorries={DASHBOARD_LORRIES}
              selectedPlate={null}
              filter="all"
              onSelectLorry={() => {}}
              height={220}
            />
          </div>
        </div>
      </div>

      {/* Row 3: Pending Requests + Latest Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        {/* Pending Requests Card */}
        <div className="bg-card border border-line rounded-card p-4 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-[800] text-ink">Pending requests</h3>
            <Link href="/requests" className="text-[12px] font-bold text-muted hover:text-ink">
              View all
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {pendingRequests.length === 0 ? (
              <p className="text-muted text-[13px] py-4 text-center">All caught up 🎉</p>
            ) : (
              pendingRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-[14px] border border-line flex-wrap"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-ink text-[12px] font-black flex items-center justify-center shrink-0">
                    {getInitials(r.customer)}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <b className="block text-[13px] text-ink font-bold">{r.customer}</b>
                    <small className="text-muted text-[11px] block">
                      {r.from} → {r.to} · {r.load} · {r.vehicle}
                    </small>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAction(r.id, "a")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-[8px] bg-[#DDF3E7] text-[#12663A] hover:bg-[#c6ebd4] transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(r.id, "r")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-[8px] bg-[#FBE0E0] text-[#B3121F] hover:bg-[#f7c8c8] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Reviews Card */}
        <div className="bg-card border border-line rounded-card p-4 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-[800] text-ink">Latest reviews</h3>
            <Link href="/reviews" className="text-[12px] font-bold text-muted hover:text-ink">
              View all
            </Link>
          </div>

          <div className="flex flex-col">
            {REVIEWS.map((rv, i) => (
              <div key={i} className="py-2.5 border-t border-line first:border-t-0">
                <div className="flex items-center justify-between">
                  <b className="text-[13px] text-ink">{rv.name}</b>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E9A800] text-[12px] tracking-widest">
                      {"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}
                    </span>
                    <small className="text-muted text-[11px]">{rv.date}</small>
                  </div>
                </div>
                <p className="text-[12px] text-muted mt-1 leading-relaxed">{rv.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
