"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomBar } from "@/components/layout/mobile-bottom-bar";

interface LayoutWrapperProps {
  children: React.ReactNode;
  currentUser?: {
    fullName: string;
    phone?: string;
    role: string;
    municipalityNameKrd: string;
    isHeadquarter: boolean;
  };
}

export function LayoutWrapper({ children, currentUser }: LayoutWrapperProps) {
  const pathname = usePathname();
  // Public standalone pages should NOT show the dashboard sidebar, topbar, or dashboard padding
  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/track");

  if (isPublicPage) {
    return (
      <main className="min-h-screen w-full flex flex-col bg-background text-foreground">
        {children}
      </main>
    );
  }

  // Full internal municipal ERP & GIS layout with RTL Sidebar, Topbar, and Persistent Mobile Bottom Bar
  return (
    <div className="flex min-h-screen w-full bg-[#F9F9FB] dark:bg-slate-950">
      {/* Responsive RTL Sidebar on the right (hidden on mobile, visible on desktop) */}
      <Sidebar />

      {/* Main dashboard content area with Topbar */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Topbar currentUser={currentUser} />
        <main className="flex-1 p-2.5 sm:p-4 md:p-5 bg-[#F9F9FB] dark:bg-slate-950 overflow-y-auto pb-20 md:pb-5">
          {children}
        </main>
        {/* Persistent Odoo Mobile Bottom Action Bar */}
        <MobileBottomBar currentUser={currentUser} />
      </div>
    </div>
  );
}

