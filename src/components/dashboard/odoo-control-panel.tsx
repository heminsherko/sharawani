"use client";

import * as React from "react";
import {
  Plus,
  Save,
  ChevronDown,
  Search,
  Filter,
  Layers,
  Star,
  List,
  LayoutGrid,
  MapPin,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Printer,
  FileSpreadsheet,
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OdooViewMode = "list" | "kanban" | "map" | "graph";

interface OdooControlPanelProps {
  currentView?: OdooViewMode;
  onViewChange?: (view: OdooViewMode) => void;
  onSearchChange?: (query: string) => void;
  onNewRecord?: () => void;
  onExportExcel?: () => void;
  title?: string;
  totalCount?: number;
}

export function OdooControlPanel({
  currentView = "list",
  onViewChange,
  onSearchChange,
  onNewRecord,
  onExportExcel,
  title = "داشبۆردی سەرپەرشتیاری شارەوانییەکان",
  totalCount = 13,
}: OdooControlPanelProps) {
  const [activeView, setActiveView] = React.useState<OdooViewMode>(currentView);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [groupByOpen, setGroupByOpen] = React.useState(false);
  const [favoritesOpen, setFavoritesOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActiveView(currentView);
  }, [currentView]);

  function handleViewSelect(view: OdooViewMode) {
    setActiveView(view);
    onViewChange?.(view);
  }

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="o_control_panel sticky top-12 z-30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2.5 shadow-xs select-none">
      {/* 1. START / RIGHT (RTL): Odoo Action Buttons [New] [Save] [Actions Dropdown] */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Primary Create Button */}
        <button
          type="button"
          onClick={onNewRecord}
          className="odoo-btn-primary flex items-center gap-1.5 shadow-xs text-xs font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>نوێ (New)</span>
        </button>

        {/* Secondary Save / Action Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActionsOpen(!actionsOpen)}
            className="odoo-btn-secondary flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <span>کردارەکان (Action)</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </button>

          {actionsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActionsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-56 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-lg z-50 text-xs text-slate-800 dark:text-slate-200">
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    handlePrint();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-right cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-[#017E84]" />
                  <span>چاپی ڕاپۆرتی فەرمی (Print)</span>
                </button>
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    if (onExportExcel) {
                      onExportExcel();
                    } else {
                      alert("داتای تەواوی ١٣ شارەوانی ئامادەکرا بۆ هەناردەکردن.");
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-right cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>هەناردەکردن بۆ ئێکسڵ (Excel)</span>
                </button>
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    window.location.reload();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-right border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                  <span>هاوکاتکردنی داتای شارەوانییەکان</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. CENTER: Unified Odoo Search View with Filters / Group By / Favorites */}
      <div className="flex-1 max-w-2xl mx-auto w-full">
        <div className="relative flex items-center rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus-within:border-[#017E84] focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-1 focus-within:ring-[#017E84] transition-all">
          <Search className="h-3.5 w-3.5 text-slate-400 mr-3 shrink-0" />
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            placeholder="گەڕان بەدوای شارەوانی، نوسراوی EDMS، زەوی GIS، یان پڕۆژە..."
            className="w-full h-8 bg-transparent px-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-right"
          />

          {/* Odoo Expandable Filter Dropdown Pills */}
          <div className="flex items-center gap-1 pl-1.5 shrink-0 border-r border-slate-200 dark:border-slate-700 pr-1">
            {/* Filters Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Filter className="h-3 w-3 text-slate-400" />
                <span>فلتەر</span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
              </button>

              {filtersOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFiltersOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-52 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-lg z-50 text-xs text-slate-800 dark:text-slate-200">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      فلتەرە باوەکان
                    </div>
                    {["پڕۆژە چالاکەکان", "داهاتی سەروو ٥ ملیۆن", "چەقبەستووی نوسراو"].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          const newF = activeFilter === f ? null : f;
                          setActiveFilter(newF);
                          setFiltersOpen(false);
                          onSearchChange?.(newF || "");
                        }}
                        className="flex w-full items-center justify-between rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-right cursor-pointer"
                      >
                        <span>{f}</span>
                        {activeFilter === f && <Check className="h-3 w-3 text-[#017E84]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Group By Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setGroupByOpen(!groupByOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Layers className="h-3 w-3 text-slate-400" />
                <span>گرووپکردن</span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
              </button>

              {groupByOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setGroupByOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1 w-44 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-lg z-50 text-xs text-slate-800 dark:text-slate-200">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      گرووپکردن بەپێی
                    </div>
                    {["پلەبەندی کارگێڕی", "دۆخی چالاکی", "بەشی پەیوەندیدار"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGroupByOpen(false)}
                        className="flex w-full items-center rounded px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-right cursor-pointer"
                      >
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Favorites Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setFavoritesOpen(!favoritesOpen)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Star className="h-3 w-3 text-amber-500" />
                <span>دڵخوازەکان</span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. END / LEFT (RTL): Odoo View Switcher [List] [Kanban] [Map] [Graph] & Paging */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Pager Indicator */}
        <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
          <span>١-{totalCount} لە {totalCount}</span>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 ml-1">
            <button
              type="button"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => handleViewSelect("list")}
            title="خشتە (List View)"
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer",
              activeView === "list"
                ? "bg-[#017E84] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleViewSelect("kanban")}
            title="کانبان (Kanban Cards)"
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer",
              activeView === "kanban"
                ? "bg-[#017E84] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleViewSelect("map")}
            title="نەخشە (Map / GIS View)"
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer",
              activeView === "map"
                ? "bg-[#017E84] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleViewSelect("graph")}
            title="ڕوونکردنەوەی گرافیکی (Graph Analytics)"
            className={cn(
              "p-1.5 rounded transition-colors cursor-pointer",
              activeView === "graph"
                ? "bg-[#017E84] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
