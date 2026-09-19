"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  HardHat,
  FileText,
  CreditCard,
  AlertTriangle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Building2,
  Shield,
  Search,
  Database,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  code?: string;
}

export const navItems: NavItem[] = [
  {
    title: "داشبۆردی گشتی و چاودێری",
    href: "/dashboard",
    icon: LayoutDashboard,
    code: "BI-01",
  },
  {
    title: "نەخشەسازی و زەویوزار",
    href: "/dashboard/parcels",
    icon: MapPin,
    badge: "GIS",
    code: "GIS-02",
  },
  {
    title: "ئەندازە و پڕۆژە خزمەتگوزارییەکان",
    href: "/projects",
    icon: HardHat,
    code: "ENG-03",
  },
  {
    title: "نوسراوە ئەلیکترۆنییەکان",
    href: "/dashboard/documents",
    icon: FileText,
    badge: "EDMS",
    code: "EDMS-04",
  },
  {
    title: "دارایی، ژمێریاری و داهات",
    href: "/dashboard/finance",
    icon: CreditCard,
    code: "FIN-05",
  },
  {
    title: "لادانی سەرپێچی و زیادەڕۆیی",
    href: "/dashboard/violations",
    icon: AlertTriangle,
    badge: "سەرپێچی",
    code: "VIO-06",
  },
  {
    title: "شارەوانییەکان و میلاکات",
    href: "/dashboard#municipalities",
    icon: Building2,
    badge: "١٣",
    code: "MUN-07",
  },
  {
    title: "تۆماری وردبینی و چاودێری",
    href: "/settings",
    icon: Shield,
    code: "AUD-08",
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  // Hide sidebar on public portals
  if (pathname === "/login" || pathname === "/") {
    return null;
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-l border-[#5D3D55] dark:border-slate-800 bg-[#714B67] dark:bg-[#1E212B] text-white transition-all duration-200 ease-in-out z-30 shrink-0 select-none shadow-sm",
        collapsed ? "w-16" : "w-60",
        "h-screen sticky top-0"
      )}
    >
      {/* Odoo Enterprise Institutional Header */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-[#5D3D55] dark:border-slate-800 bg-[#5D3D55] dark:bg-[#181A22]">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#017E84] text-white shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-right leading-none space-y-0.5">
              <span className="font-bold text-xs text-white tracking-tight">
                شارەوانییەکانی گەرمیان
              </span>
              <span className="text-[9px] text-white/70 font-mono">
                Odoo Gov ERP
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-[#017E84] text-white">
            <Building2 className="h-4 w-4" />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-6 w-6 inline-flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors",
            collapsed && "mx-auto mt-1 hidden"
          )}
          aria-label={collapsed ? "فراوانکردن" : "بچوککردنەوە"}
          title={collapsed ? "فراوانکردن" : "بچوککردنەوە"}
        >
          {collapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </div>

      {/* Navigation List - High Data Density */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 text-xs">
        {!collapsed && (
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/60 border-b border-white/10 mb-2 flex items-center justify-between">
            <span>مۆدیوولەکانی سیستەم</span>
            <span className="font-mono text-[9px] text-[#017E84] bg-white/90 px-1 py-0.2 rounded font-bold">v18</span>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded px-2.5 py-2 text-xs font-medium transition-all",
                isActive
                  ? "bg-[#017E84] text-white font-bold shadow-xs"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
                collapsed && "justify-center px-0 py-2.5"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-white" : "text-white/70 group-hover:text-white"
                )}
              />

              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.2 text-[9px] font-mono font-bold shrink-0",
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-white/10 text-white/80"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Official Odoo Database & System Status Block */}
      {!collapsed && (
        <div className="p-2.5 border-t border-[#5D3D55] dark:border-slate-800 bg-[#5D3D55] dark:bg-[#181A22] space-y-1 text-[10px]">
          <div className="flex items-center justify-between text-white/80">
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-emerald-300" />
              <span>پێگەی داتا: PostgreSQL</span>
            </span>
            <span className="text-emerald-300 font-mono font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ئۆنلاین
            </span>
          </div>
          <div className="text-white/60 font-mono text-[9px] flex items-center justify-between">
            <span>Odoo Enterprise v18</span>
            <span>KRG-GDM</span>
          </div>
        </div>
      )}
    </aside>
  );
}
