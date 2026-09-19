"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Grid,
  Search,
  Plus,
  Layers,
  LayoutDashboard,
  MapPin,
  FileText,
  AlertTriangle,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  currentUser?: {
    fullName: string;
    role: string;
    municipalityNameKrd: string;
    isHeadquarter: boolean;
  };
}

export function MobileBottomBar({ currentUser }: MobileBottomBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [quickCreateOpen, setQuickCreateOpen] = React.useState(false);

  // Trigger app drawer (waffle)
  const handleOpenApps = () => {
    window.dispatchEvent(new CustomEvent("garmian-open-apps"));
  };

  // Trigger search focus
  const handleTriggerSearch = () => {
    window.dispatchEvent(new CustomEvent("garmian-trigger-search"));
    // Also scroll top to search input if available
    const searchInput = document.querySelector<HTMLInputElement>("input[type='text']");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => searchInput.focus(), 150);
    }
  };

  // View switcher: toggles view mode
  const handleToggleView = () => {
    window.dispatchEvent(new CustomEvent("garmian-toggle-view"));
  };

  // Center Primary FAB: context-sensitive or opens quick action drawer
  const handlePrimaryFab = () => {
    if (pathname.startsWith("/dashboard/parcels")) {
      window.dispatchEvent(new CustomEvent("garmian-add-parcel"));
    } else if (pathname.startsWith("/dashboard/documents")) {
      window.dispatchEvent(new CustomEvent("garmian-add-doc"));
    } else if (pathname.startsWith("/dashboard/violations")) {
      router.push("/dashboard/violations/new");
    } else {
      setQuickCreateOpen(true);
    }
  };

  return (
    <>
      {/* 1. PERSISTENT FLOATING BOTTOM ACTION BAR (< 768px ONLY) */}
      <nav
        dir="rtl"
        aria-label="مێنۆی مۆبایلی فەرمی"
        className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-2 py-1 select-none"
      >
        <div className="flex items-center justify-around h-14 max-w-md mx-auto">
          {/* 1. Home / Dashboard */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold transition-colors min-h-[44px]",
              pathname === "/dashboard"
                ? "text-[#714B67] dark:text-[#c48eaf]"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <LayoutDashboard className="h-5 w-5 mb-0.5" />
            <span>داشبۆرد</span>
          </Link>

          {/* 2. Search & Filter trigger */}
          <button
            type="button"
            onClick={handleTriggerSearch}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors min-h-[44px] cursor-pointer"
          >
            <Search className="h-5 w-5 mb-0.5 text-[#017E84]" />
            <span>گەڕان</span>
          </button>

          {/* 3. Center Elevated Primary FAB (+) */}
          <div className="flex-1 flex justify-center -mt-6">
            <button
              type="button"
              onClick={handlePrimaryFab}
              className="h-13 w-13 rounded-full bg-[#017E84] hover:bg-[#00676C] text-white shadow-xl flex items-center justify-center border-3 border-white dark:border-slate-900 active:scale-90 transition-transform cursor-pointer"
              title="تۆماری نوێ (Create New)"
              aria-label="تۆماری نوێ"
            >
              <Plus className="h-6 w-6 stroke-[3]" />
            </button>
          </div>

          {/* 4. View Switcher (Kanban vs List vs Map) */}
          <button
            type="button"
            onClick={handleToggleView}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors min-h-[44px] cursor-pointer"
            title="گۆڕینی جۆری پیشاندان"
          >
            <Layers className="h-5 w-5 mb-0.5 text-[#714B67] dark:text-purple-400" />
            <span>بینین</span>
          </button>

          {/* 5. Apps Grid Overlay */}
          <button
            type="button"
            onClick={handleOpenApps}
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors min-h-[44px] cursor-pointer"
          >
            <Grid className="h-5 w-5 mb-0.5" />
            <span>ئەپەکان</span>
          </button>
        </div>
      </nav>

      {/* 2. QUICK CREATE BOTTOM DRAWER (Triggered by FAB on General Screens) */}
      {quickCreateOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs block md:hidden"
            onClick={() => setQuickCreateOpen(false)}
          />
          <div
            dir="rtl"
            className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-5 text-right animate-in slide-in-from-bottom duration-200"
          >
            {/* Pull Handle */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#017E84] text-white flex items-center justify-center shadow-xs">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    کرداری نوێ (Quick Create)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    هەڵبژاردنی جۆری تۆمار یان پڕۆسەی کارگێڕی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickCreateOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Choices Grid */}
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/dashboard/parcels"
                onClick={() => {
                  setQuickCreateOpen(false);
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("garmian-add-parcel"));
                  }, 300);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#017E84] bg-slate-50 dark:bg-slate-850 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    تۆمارکردنی پارچە زەوی نوێ (GIS Cadastre)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    تۆماری سەنەد، کێشانی سنور لەسەر نەخشە و دەرکردنی مۆڵەت
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/documents"
                onClick={() => {
                  setQuickCreateOpen(false);
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("garmian-add-doc"));
                  }, 300);
                }}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#017E84] bg-slate-50 dark:bg-slate-850 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[#714B67] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    دروستکردنی نوسراوی نوێ (EDMS)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    ئاڕاستەکردنی فەرمی نێوان ١٣ شارەوانی گەرمیان بە بارکۆد
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/violations/new"
                onClick={() => setQuickCreateOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#017E84] bg-slate-50 dark:bg-slate-850 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    تۆماری مەیدانی زیادەڕۆیی و سەرپێچی
                  </div>
                  <div className="text-[10px] text-slate-500">
                    پشکنینی تیمەکانی زیادەڕۆیی لەسەر زەوی گشتی
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

