"use client";

import * as React from "react";
import { HardHat, ArrowLeft, CheckSquare, Square, Eye, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { DashboardProjectDTO } from "@/actions/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/export-csv";

interface ProjectsTableProps {
  projects: DashboardProjectDTO[];
  onInspect?: (project: DashboardProjectDTO) => void;
}

export function ProjectsTable({ projects, onInspect }: ProjectsTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = React.useState(false);

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedIds({});
      setSelectAll(false);
    } else {
      const all: Record<string, boolean> = {};
      projects.forEach((p) => (all[p.id] = true));
      setSelectedIds(all);
      setSelectAll(true);
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleExportExcel() {
    const headers = [
      "ناوی پڕۆژە",
      "شارەوانی سەرپەرشتیار",
      "کۆمپانیای بەڵێندەر",
      "بودجەی تەرخانکراو (IQD)",
      "ڕێژەی تەواوبوون (%)",
      "دۆخی پڕۆژە",
    ];

    const rows = projects.map((p) => [
      p.title,
      p.municipalityName,
      p.contractor,
      p.budgetFormatted,
      `${p.completionRate}%`,
      p.status === "COMPLETED"
        ? "تەواوکراو"
        : p.status === "ONGOING"
        ? "لە جێبەجێکردندا"
        : "تەندەرینگ",
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`garmian_projects_${dateStr}`, headers, rows);
  }

  return (
    <div className="rounded border border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900 text-right shadow-xs overflow-hidden">
      {/* Table Header / Title */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-[#2E7D32] text-white flex items-center justify-center shadow-xs">
            <HardHat className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>خشتەی پڕۆژە ئەندازیارییەکان</span>
              <span className="font-mono text-[10px] text-[#2E7D32] font-bold">
                (Odoo Projects)
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportExcel}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
            title="هەناردەکردنی پڕۆژەکان بۆ فایلی ئێکسڵ بە کۆدکردنی فەرمی کوردی UTF-8"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>هەناردەکردن بۆ ئێکسڵ</span>
          </button>

          <Link
            href="/projects"
            className="text-xs font-bold text-[#017E84] hover:underline inline-flex items-center gap-1"
          >
            <span>تەواوی پڕۆژەکان</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Odoo Dense List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-800 select-none">
            <tr className="h-9 text-xs font-semibold uppercase tracking-wider">
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
              <th className="py-2.5 px-3">ناوی پڕۆژە</th>
              <th className="py-2.5 px-3">شارەوانی</th>
              <th className="py-2.5 px-3">بەڵێندەر</th>
              <th className="py-2.5 px-3 text-left">بودجە (IQD)</th>
              <th className="py-2.5 px-3 text-center">ڕێژەی تەواوبوون</th>
              <th className="py-2.5 px-3 text-center">دۆخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {projects.map((proj) => {
              const isSelected = !!selectedIds[proj.id];

              return (
                <tr
                  key={proj.id}
                  onClick={() => onInspect?.(proj)}
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
                      toggleRow(proj.id);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[#017E84]" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </td>

                  {/* Title */}
                  <td className="py-1.5 px-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block max-w-xs truncate text-sm">
                      {proj.title}
                    </span>
                  </td>

                  {/* Municipality */}
                  <td className="py-1.5 px-3">
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {proj.municipalityName}
                    </span>
                  </td>

                  {/* Contractor */}
                  <td className="py-1.5 px-3">
                    <span className="text-slate-600 dark:text-slate-400 text-xs truncate max-w-[120px] block">
                      {proj.contractor}
                    </span>
                  </td>

                  {/* Budget */}
                  <td className="py-1.5 px-3 text-left">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {proj.budgetFormatted}
                    </span>
                  </td>

                  {/* Progress Bar */}
                  <td className="py-1.5 px-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#017E84] rounded-full transition-all"
                          style={{ width: `${proj.completionRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        {proj.completionRate}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-1.5 px-3 text-center">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded font-medium",
                        proj.completionRate >= 90
                          ? "odoo-badge-approved"
                          : proj.completionRate >= 40
                          ? "odoo-badge-pending"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      {proj.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
