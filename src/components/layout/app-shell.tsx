"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface AppShellProps {
  children: React.ReactNode;
  currentUser?: {
    fullName: string;
    phone?: string;
    role: string;
    municipalityNameKrd: string;
    isHeadquarter: boolean;
  };
}

export function AppShell({ children, currentUser }: AppShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isLandingPage = pathname === "/";

  // Hide the sidebar and topbar on the login page as requested
  if (isLoginPage) {
    return (
      <main className="min-h-screen w-full flex-1 bg-background">
        {children}
      </main>
    );
  }

  // Standalone public portal for the landing page
  if (isLandingPage) {
    return (
      <main className="min-h-screen w-full flex-1 bg-background">
        {children}
      </main>
    );
  }

  // Full internal municipal ERP & GIS layout with RTL Sidebar and Topbar
  return (
    <div className="flex min-h-screen w-full">
      {/* Responsive RTL Sidebar on the right */}
      <Sidebar />

      {/* Main dashboard content area with Topbar */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Topbar currentUser={currentUser} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}

