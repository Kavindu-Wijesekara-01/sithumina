"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface RiderItem {
  id: string; // e.g. R-1001
  name: string;
  phone: string;
  nic?: string;
  vehicle?: string;
  status: 1 | 0;
}

const INITIAL_RIDERS: RiderItem[] = [
  { name: "Nuwan Perera", id: "R-1001", phone: "077 234 5678", vehicle: "WP LB-4521", status: 1 },
];

export default function RidersPage() {
  const { showToast } = useToast();
  const [riders, setRiders] = useState<RiderItem[]>(INITIAL_RIDERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [riderId, setRiderId] = useState("");

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const openDrawer = () => {
    setName("");
    setPhone("");
    setNic("");
    setRiderId(`R-${1001 + riders.length}`);
    setDrawerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !riderId.trim()) {
      showToast("Please enter Name, Phone and Rider ID");
      return;
    }

    const cleanId = riderId.trim().toUpperCase();
    if (riders.some((r) => r.id.toUpperCase() === cleanId)) {
      showToast("Rider ID already exists");
      return;
    }

    const newRider: RiderItem = {
      name: name.trim(),
      id: cleanId,
      phone: phone.trim(),
      nic: nic.trim(),
      vehicle: "—",
      status: 1,
    };

    setRiders([newRider, ...riders]);
    setDrawerOpen(false);
    showToast(`Rider ${cleanId} added! Can log in now.`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[18px] font-extrabold text-ink">
          {riders.length} riders
        </h2>

        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex items-center gap-2 bg-primary text-ink px-4 py-2.5 rounded-btn font-extrabold text-[13px] hover:opacity-95 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <span>+</span>
          <span>Add rider</span>
        </button>
      </div>

      {/* Riders Table Card */}
      <div className="bg-card border border-line rounded-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b border-line bg-surface/40 text-[12px] text-muted font-extrabold">
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Login ID</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-line last:border-b-0 hover:bg-[#FAF8F2] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-ink text-[12px] font-black flex items-center justify-center shrink-0">
                        {getInitials(r.name)}
                      </div>
                      <span className="font-extrabold text-ink">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-ink">
                    <span className="bg-[#FFF6D6] text-ink px-2 py-0.5 rounded border border-primary/30">
                      🔑 {r.id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted font-semibold">{r.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-pill ${
                        r.status === 1
                          ? "bg-[#DDF3E7] text-[#12663A]"
                          : "bg-surface text-muted"
                      }`}
                    >
                      {r.status === 1 ? "Active" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer for Add Rider */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-[420px] bg-card h-full shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto z-10 border-l border-line">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-[18px] font-extrabold text-ink">Add rider</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-muted hover:text-ink text-[18px] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-ink">
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruwan Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-btn border-2 border-line bg-surface px-3 text-ink text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-ink">
                  Phone number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="077 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-btn border-2 border-line bg-surface px-3 text-ink text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-ink">
                  NIC number
                </label>
                <input
                  type="text"
                  placeholder="199012345678"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="h-11 rounded-btn border-2 border-line bg-surface px-3 text-ink text-[14px] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-ink">
                  Rider ID (Required Login ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. R-1005"
                  value={riderId}
                  onChange={(e) => setRiderId(e.target.value)}
                  className="h-11 rounded-btn border-2 border-line bg-surface px-3 text-ink text-[14px] font-mono font-bold uppercase focus:outline-none focus:border-primary"
                />
                <small className="text-muted text-[11px] font-semibold">
                  🔑 Rider uses this ID to log into the Rider Dashboard from the main login screen.
                </small>
              </div>

              <div className="mt-auto pt-4 flex flex-col gap-2">
                <button
                  type="submit"
                  className="h-12 rounded-btn bg-primary text-ink font-extrabold text-[14px] hover:opacity-95 transition-opacity shadow-sm cursor-pointer"
                >
                  Save Rider
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-12 rounded-btn border-2 border-line text-ink font-bold text-[14px] hover:bg-surface transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
