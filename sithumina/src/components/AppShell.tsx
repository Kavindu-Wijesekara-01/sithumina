"use client";

import React, { useState } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { Footer } from "./Footer";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Top Bar for Desktop and Mobile */}
      <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Accessible Mobile Slide-in Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto min-h-0">
        {/* Sticky Desktop Sidebar (240px) */}
        <Sidebar />

        {/* Main Routed Content Column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
          {/* Footer at the end of the main content column */}
          <Footer />
        </div>
      </div>
    </div>
  );
};
