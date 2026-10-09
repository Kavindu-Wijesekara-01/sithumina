"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export interface WebBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  target: "all" | "riders" | "customers";
  isActive: boolean;
  createdAt: number;
}

const STORAGE_KEY = "sithumina_admin_banners";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<WebBanner[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tag, setTag] = useState("PROMO");
  const [target, setTarget] = useState<"all" | "riders" | "customers">("all");
  const [isActive, setIsActive] = useState(true);

  // Load banners from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBanners(parsed);
        }
      }
    } catch {}
  }, []);

  const saveBannersToStorage = (updated: WebBanner[]) => {
    setBanners(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleOpenAddModal = () => {
    setTitle("");
    setSubtitle("");
    setTag("PROMO");
    setTarget("all");
    setIsActive(true);
    setModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please enter a banner title");
      return;
    }

    const newBanner: WebBanner = {
      id: `banner-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim(),
      tag: tag.trim().toUpperCase() || "PROMO",
      target,
      isActive,
      createdAt: Date.now(),
    };

    const updated = [newBanner, ...banners];
    saveBannersToStorage(updated);
    setModalOpen(false);
    showToast("Banner added successfully!");
  };

  const handleDeleteBanner = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    saveBannersToStorage(updated);
    showToast("Banner deleted");
  };

  const handleToggleActive = (id: string) => {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    saveBannersToStorage(updated);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-[24px] font-extrabold text-ink tracking-tight">
          Settings & Configurations
        </h1>
        <p className="text-[13px] font-semibold text-muted mt-0.5">
          Manage promotional banners, announcements, and fleet operational preferences
        </p>
      </div>

      {/* SECTION 1: BANNER MANAGEMENT */}
      <div className="bg-card border border-line rounded-card p-5 shadow-card flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-line">
          <div>
            <h2 className="text-[17px] font-extrabold text-ink flex items-center gap-2">
              <span>📢</span>
              <span>Promotional & App Banners</span>
            </h2>
            <p className="text-[12px] font-medium text-muted mt-0.5">
              Create announcement banners shown dynamically across mobile and web interfaces
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-pill bg-primary text-ink text-[13px] font-extrabold shadow-sm hover:bg-yellow-400 transition-all cursor-pointer"
          >
            <span>+</span>
            <span>Add Banner</span>
          </button>
        </div>

        {/* Banners List */}
        {banners.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
            <span className="text-4xl mb-1">📢</span>
            <h3 className="text-[16px] font-extrabold text-ink">No Banners Configured</h3>
            <p className="text-[12.5px] font-medium text-muted max-w-md">
              You haven&apos;t created any promotional or announcement banners yet. Click &quot;Add Banner&quot; above to publish your first banner.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-3 px-4 py-2 rounded-pill bg-primary text-ink text-[12.5px] font-black hover:bg-yellow-400 transition-all cursor-pointer"
            >
              + Create First Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  banner.isActive
                    ? "bg-[#FAF9F5] border-line shadow-sm"
                    : "bg-[#F3F1EC] border-line/60 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-ink text-[10px] font-black px-2 py-0.5 rounded">
                        {banner.tag}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          banner.target === "riders"
                            ? "bg-[#FFE08A] text-[#5B4300]"
                            : banner.target === "customers"
                            ? "bg-[#E0F2FE] text-[#0369A1]"
                            : "bg-[#EFECE1] text-ink"
                        }`}
                      >
                        {banner.target === "all"
                          ? "👥 All Users"
                          : banner.target === "riders"
                          ? "🚚 Riders Only"
                          : "👤 Customers Only"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner.id)}
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                        banner.isActive
                          ? "bg-[#DDF3E7] text-[#12663A] border border-[#A6E1BF]"
                          : "bg-[#EAE7DC] text-muted border border-line"
                      }`}
                    >
                      {banner.isActive ? "● Active" : "○ Inactive"}
                    </button>
                  </div>

                  <h3 className="text-[15px] font-extrabold text-ink leading-snug">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-[12px] font-medium text-muted mt-1 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-line text-[11px] text-muted">
                  <span>Created {new Date(banner.createdAt).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="text-[#B3121F] font-bold hover:underline cursor-pointer"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: SYSTEM & FLEET OPERATIONS PROFILE */}
      <div className="bg-card border border-line rounded-card p-5 shadow-card flex flex-col gap-4">
        <h2 className="text-[17px] font-extrabold text-ink flex items-center gap-2">
          <span>⚙️</span>
          <span>System & Fleet Information</span>
        </h2>

        <div className="divide-y divide-line text-[13px]">
          <div className="py-2.5 flex items-center justify-between">
            <span className="font-semibold text-muted">Company Name</span>
            <span className="font-bold text-ink">Sithumina Transport (Pvt) Ltd</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="font-semibold text-muted">Head Office / Terminal</span>
            <span className="font-bold text-ink">Pettah Goods Terminal, Colombo 11</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="font-semibold text-muted">Customer Support Hotline</span>
            <span className="font-bold text-ink">077 123 4567 / 011 234 5678</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="font-semibold text-muted">Real-Time GPS Streaming</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-[#DDF3E7] text-[#12663A] font-extrabold text-[12px]">
              <span className="w-2 h-2 rounded-full bg-[#1E9E5A] animate-pulse" />
              Active & Synchronized
            </span>
          </div>
        </div>
      </div>

      {/* ADD BANNER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-card w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
              <div>
                <h3 className="text-[18px] font-extrabold text-ink">Add New Banner</h3>
                <p className="text-[12px] font-semibold text-muted">
                  Create a live announcement or promotional notice
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface text-ink font-bold flex items-center justify-center hover:bg-line transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special 10% Discount on Kandy Express Route"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-surface text-ink text-[13px] font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-ink mb-1">
                  Subtitle / Announcement Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Valid for all bookings confirmed before Sunday midnight"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-line bg-surface text-ink text-[13px] font-semibold focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-ink mb-1">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    placeholder="PROMO / NOTICE / NEW"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-[13px] font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-ink mb-1">
                    Target Audience
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-line bg-surface text-ink text-[13px] font-semibold focus:outline-none focus:border-primary"
                  >
                    <option value="all">👥 All Users</option>
                    <option value="riders">🚚 Riders Only</option>
                    <option value="customers">👤 Customers Only</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Card */}
              <div>
                <span className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
                  Live Preview
                </span>
                <div className="bg-[#26231B] text-[#F6F1DF] p-3.5 rounded-xl border border-primary/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-primary text-ink text-[9px] font-black px-1.5 py-0.5 rounded">
                      {tag || "PROMO"}
                    </span>
                    <span className="text-[10px] text-muted font-bold">
                      {target === "all" ? "👥 All Users" : target === "riders" ? "🚚 Riders" : "👤 Customers"}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-extrabold text-primary leading-tight">
                    {title || "Your Banner Title Will Appear Here"}
                  </h4>
                  <p className="text-[11.5px] text-[#E7E2D0] mt-0.5">
                    {subtitle || "Subtitle and description will be displayed here."}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-line text-[13px] font-bold text-muted hover:text-ink transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-ink text-[13px] font-extrabold shadow-sm hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Save & Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
