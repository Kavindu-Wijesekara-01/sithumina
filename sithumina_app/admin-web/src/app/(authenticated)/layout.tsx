import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-[900px]:grid-cols-[240px_1fr] max-[899px]:grid-cols-1 min-h-screen bg-surface">
      <Sidebar />
      <div className="min-w-0 flex flex-col">
        <Topbar />
        <main className="p-6 max-[899px]:px-3.5 pb-10 flex flex-col gap-[18px]">
          {children}
        </main>
      </div>
    </div>
  );
}
