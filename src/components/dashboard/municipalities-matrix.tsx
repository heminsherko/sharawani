"use client";

import * as React from "react";
import {
  Building2,
  AlertTriangle,
  Filter,
  Layers,
  CheckSquare,
  Square,
  HardHat,
  Coins,
  FileText,
  MapPin,
  ExternalLink,
  Eye,
} from "lucide-react";
import { MunicipalityMatrixItem } from "@/actions/dashboard";
import { cn } from "@/lib/utils";

interface MunicipalitiesMatrixProps {
  items: MunicipalityMatrixItem[];
  viewMode?: "list" | "kanban";
  onInspect?: (item: MunicipalityMatrixItem) => void;
}

export function MunicipalitiesMatrix({
  items,
  viewMode = "list",
  onInspect,
}: MunicipalitiesMatrixProps) {
  const [filterTier, setFilterTier] = React.useState<string>("ALL");
  const [selectedIds, setSelectedIds] = React.useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = React.useState(false);

  const filteredItems = items.filter((item) => {
    if (filterTier === "ALL") return true;
    if (filterTier === "HQ") return item.isHeadquarter;
    if (filterTier === "TIER_1") return item.tier.includes("TIER 1");
    if (filterTier === "TIER_2_3")
      return item.tier.includes("TIER 2") || item.tier.includes("TIER 3");
    return true;
  });

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedIds({});
      setSelectAll(false);
    } else {
      const all: Record<string, boolean> = {};
      filteredItems.forEach((it) => (all[it.id] = true));
      setSelectedIds(all);
      setSelectAll(true);
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  return (
    <div
      id="municipalities"
      className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-right overflow-hidden font-sans"
    >
      {/* Odoo Table / Kanban Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#714B67] text-white shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>تۆماری ١٣ شارەوانی گەرمیان</span>
              <span className="font-mono text-[10px] text-[#017E84] font-bold">
                (Odoo Multi-Branch Matrix)
              </span>
            </h2>
          </div>
        </div>

        {/* Filters & Bulk Action Status */}
        <div className="flex items-center gap-2 text-xs">
          {selectedCount > 0 && (
            <div className="flex items-center gap-1 bg-[#E2F7F2] text-[#017E84] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#B3E7DC]">
              <span>{selectedCount} دیاریکراوە</span>
              <button
                onClick={() => setSelectedIds({})}
                className="mr-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Tier Filter Chips */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 ml-1 flex items-center gap-0.5">
              <Filter className="h-3 w-3" />
              <span>پۆلێن:</span>
            </span>
            <button
              onClick={() => setFilterTier("ALL")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterTier === "ALL"
                  ? "bg-[#017E84] text-white"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              هەموو (١٣)
            </button>
            <button
              onClick={() => setFilterTier("TIER_1")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterTier === "TIER_1"
                  ? "bg-[#017E84] text-white"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              پلە یەک
            </button>
            <button
              onClick={() => setFilterTier("TIER_2_3")}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                filterTier === "TIER_2_3"
                  ? "bg-[#017E84] text-white"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
              }`}
            >
              ناحیەکان
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: ODOO ENTERPRISE LIST VIEW TABLE */}
      {viewMode === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 select-none">
                {/* Checkbox for bulk actions */}
                <th className="py-2.5 px-3 text-center w-8">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    {selectAll ? (
                      <CheckSquare className="h-4 w-4 text-[#017E84]" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">#</th>
                <th className="py-2.5 px-3 text-right">شارەوانی / دەسەڵاتی لقی کارگێڕی</th>
                <th className="py-2.5 px-3 text-center">کۆد</th>
                <th className="py-2.5 px-3 text-center">ئاستی پلەبەندی</th>
                <th className="py-2.5 px-3 text-center">پڕۆژەکان</th>
                <th className="py-2.5 px-3 text-right">داهاتی فەرمی ئەمڕۆ (IQD)</th>
                <th className="py-2.5 px-3 text-center">نوسراوی لە گەڕاندا</th>
                <th className="py-2.5 px-3 text-center">دۆخی چاودێری</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredItems.map((item, idx) => {
                const isSelected = !!selectedIds[item.id];
                const isBottleneck = item.documentBottlenecks >= 3;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onInspect?.(item)}
                    className={cn(
                      "h-10 cursor-pointer transition-colors even:bg-[#FAFAFB] dark:even:bg-slate-850/40",
                      isSelected
                        ? "bg-[#E2F7F2]/50 hover:bg-[#E2F7F2]"
                        : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    )}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-1.5 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(item.id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[#017E84]" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </td>

                    {/* Number */}
                    <td className="py-1.5 px-2 font-mono text-xs text-slate-400">
                      {(idx + 1).toString().padStart(2, "0")}
                    </td>

                    {/* Municipality Name */}
                    <td className="py-1.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                        {item.isHeadquarter && (
                          <span className="h-2 w-2 rounded-full bg-[#714B67]" />
                        )}
                        <span>{item.nameKrd}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.nameEng}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="py-1.5 px-3 text-center">
                      <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {item.code}
                      </span>
                    </td>

                    {/* Tier */}
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded font-mono text-xs font-medium inline-block",
                          item.isHeadquarter
                            ? "bg-[#F3E8FF] text-[#6B21A8] dark:bg-purple-950/60 dark:text-purple-300 font-bold"
                            : item.tier.includes("TIER 1")
                            ? "bg-[#E0F2FE] text-[#0369A1] dark:bg-blue-950/60 dark:text-blue-300 font-bold"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}
                      >
                        {item.tier}
                      </span>
                    </td>

                    {/* Projects Count */}
                    <td className="py-1.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold">
                        <HardHat className="h-3.5 w-3.5 text-[#2E7D32]" />
                        <span>{item.activeProjects}</span>
                      </div>
                    </td>

                    {/* Daily Revenue */}
                    <td className="py-1.5 px-3 text-left">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {item.dailyRevenueFormatted}
                      </span>
                    </td>

                    {/* Document Queue */}
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={cn(
                          "font-mono text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                          isBottleneck
                            ? "bg-[#FDE8E8] text-[#9B1C1C] border border-red-200"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        {isBottleneck && <AlertTriangle className="h-3 w-3" />}
                        <span>{item.documentBottlenecks} نوسراو</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-1.5 px-3 text-center">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-0.5 rounded font-medium inline-block",
                          item.status === "NORMAL"
                            ? "odoo-badge-approved"
                            : item.status === "AUDIT_REQUIRED"
                            ? "odoo-badge-pending"
                            : "odoo-badge-rejected"
                        )}
                      >
                        {item.statusText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: ODOO ENTERPRISE KANBAN CARDS */}
      {viewMode === "kanban" && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 bg-[#F8F9FA] dark:bg-slate-950">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onInspect?.(item)}
              className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs hover:border-[#017E84] hover:shadow-md transition-all cursor-pointer space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {item.nameKrd}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.code} • {item.tier}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded font-medium",
                    item.status === "NORMAL"
                      ? "odoo-badge-approved"
                      : item.status === "AUDIT_REQUIRED"
                      ? "odoo-badge-pending"
                      : "odoo-badge-rejected"
                  )}
                >
                  {item.statusText}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">پڕۆژەی چالاک:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {item.activeProjects} پڕۆژە
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">داهاتی ئەمڕۆ:</span>
                  <span className="font-mono font-bold text-[#017E84]">
                    {item.dailyRevenueFormatted}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
