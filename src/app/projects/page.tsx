"use client";

import * as React from "react";
import {
  HardHat,
  Plus,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Printer,
  ChevronDown,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { OdooInspectionModal, InspectionRecord } from "@/components/dashboard/odoo-inspection-modal";
import { OdooCreateModal } from "@/components/dashboard/odoo-create-modal";
import { cn } from "@/lib/utils";

interface ProjectItem {
  id: string;
  code: string;
  title: string;
  municipality: string;
  contractor: string;
  budget: number;
  budgetFormatted: string;
  completionRate: number;
  status: string;
  statusType: "APPROVED" | "PENDING" | "REJECTED";
  startDate: string;
  endDate: string;
  boqStage: string;
}

const initialProjectsData: ProjectItem[] = [
  {
    id: "proj-1",
    code: "PRJ-KLR-01",
    title: "قیرتاوکردن و ئاوەڕۆی لوولەیی گەڕەکی شەهیدان - کەلار",
    municipality: "سەرۆکایەتی شارەوانی کەلار",
    contractor: "کۆمپانیای گەرمیان بۆ بەڵێندەرایەتی گشتی",
    budget: 485000000,
    budgetFormatted: "٤٨٥,٠٠٠,٠٠٠ د.ع",
    completionRate: 68,
    status: "بەردەوامە (قیرتاو)",
    statusType: "PENDING",
    startDate: "2025/08/01",
    endDate: "2026/10/30",
    boqStage: "پێشینەی پێنجەم پەسەندکراوە",
  },
  {
    id: "proj-2",
    code: "PRJ-KFR-02",
    title: "کۆنکرێتکردنی کۆڵانەکانی گەڕەکی ڕزگاری و ئیسکان - کفری",
    municipality: "سەرۆکایەتی شارەوانی کفری",
    contractor: "کۆمپانیای تەلارساز بۆ بیناکاری",
    budget: 240000000,
    budgetFormatted: "٢٤٠,٠٠٠,٠٠٠ د.ع",
    completionRate: 92,
    status: "کۆتایی (پشکنینی تاقیگەیی)",
    statusType: "APPROVED",
    startDate: "2025/04/15",
    endDate: "2026/05/20",
    boqStage: "پێشینەی کۆتایی لە وردبینیدایە",
  },
  {
    id: "proj-3",
    code: "PRJ-RZG-03",
    title: "نۆژەنکردنەوەی بلواری سەرەکی و سەوزایی - ڕزگاری",
    municipality: "شارەوانی ڕزگاری (سمود)",
    contractor: "بەڵێندەری ناوخۆیی - دیوانی شارەوانی",
    budget: 120000000,
    budgetFormatted: "١٢٠,٠٠٠,٠٠٠ د.ع",
    completionRate: 45,
    status: "بەردەوامە (خاکڕێژی و ڕووناکی)",
    statusType: "PENDING",
    startDate: "2025/11/01",
    endDate: "2026/08/15",
    boqStage: "پێشینەی سێیەم تەواوکراوە",
  },
  {
    id: "proj-4",
    code: "PRJ-BWN-04",
    title: "دروستکردنی باخچە و پارک لە کەناراوەکانی سیروان - باوەنوور",
    municipality: "شارەوانی پێباز (باوەنوور)",
    contractor: "تەندەری گشتی بەڕێوەبەرایەتی گشتی",
    budget: 180000000,
    budgetFormatted: "١٨٠,٠٠٠,٠٠٠ د.ع",
    completionRate: 15,
    status: "لە قۆناغی تەندەرین",
    statusType: "PENDING",
    startDate: "2026/02/01",
    endDate: "2027/01/15",
    boqStage: "خشتەی بڕەکان (BOQ) لەژێر ڕەزامەندیدایە",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectItem[]>(initialProjectsData);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [inspectedRecord, setInspectedRecord] = React.useState<InspectionRecord | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(q) ||
      p.municipality.toLowerCase().includes(q) ||
      p.contractor.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    );
  });

  function handleInspect(proj: ProjectItem) {
    setInspectedRecord({
      id: proj.id,
      type: "project",
      title: proj.title,
      codeOrBarcode: proj.code,
      municipalityName: proj.municipality,
      status: proj.status,
      statusType: proj.statusType,
      primaryMetricLabel: "بودجەی پڕۆژە (IQD)",
      primaryMetricValue: proj.budgetFormatted,
      secondaryMetricLabel: "ڕێژەی تەواوبوون",
      secondaryMetricValue: `${proj.completionRate}%`,
      details: {
        "بەڵێندەری جێبەجێکار": proj.contractor,
        "شارەوانی سەرپەرشتیار": proj.municipality,
        "بەرواری دەستپێکردن": proj.startDate,
        "بەرواری تەواوبوون": proj.endDate,
        "قۆناغی خشتەی بڕەکان (BOQ)": proj.boqStage,
      },
    });
  }

  function handleStatusUpdate(id: string, newStatus: string, statusType: "APPROVED" | "REJECTED" | "PENDING") {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus, statusType } : p))
    );
  }

  return (
    <div className="space-y-4 text-right font-sans" dir="rtl">
      {/* Control Panel Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#2E7D32] text-white flex items-center justify-center shadow-xs">
            <HardHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ئەندازە و پڕۆژە خزمەتگوزارییەکان (Projects Management)
            </h1>
            <p className="text-xs text-slate-500">
              تەندەرین، جێبەجێکردن و چاودێری پڕۆژە ژێرخانییەکانی گەرمیان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="odoo-btn-primary flex items-center gap-1.5 shadow-xs text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>پڕۆژەی نوێ (New Project)</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="odoo-btn-secondary flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>چاپکردنی ڕاپۆرت</span>
          </button>
        </div>
      </div>

      {/* Search & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-2.5 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەپێی ناوی پڕۆژە، شارەوانی، بەڵێندەر..."
            className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 pr-9 pl-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">
            {filteredProjects.length} پڕۆژە
          </span>
          <div className="flex items-center rounded border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors cursor-pointer",
                viewMode === "list" ? "bg-[#017E84] text-white" : "text-slate-500 hover:bg-slate-200"
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded transition-colors cursor-pointer",
                viewMode === "kanban" ? "bg-[#017E84] text-white" : "text-slate-500 hover:bg-slate-200"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 select-none">
                <th className="py-2.5 px-3">کۆد</th>
                <th className="py-2.5 px-3">ناوی پڕۆژەی ژێرخانی</th>
                <th className="py-2.5 px-3">شارەوانی</th>
                <th className="py-2.5 px-3">بەڵێندەری جێبەجێکار</th>
                <th className="py-2.5 px-3 text-left">بودجەی تەرخانکراو (IQD)</th>
                <th className="py-2.5 px-3 text-center">ڕێژەی تەواوبوون</th>
                <th className="py-2.5 px-3 text-center">دۆخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredProjects.map((proj) => (
                <tr
                  key={proj.id}
                  onClick={() => handleInspect(proj)}
                  className="h-11 cursor-pointer transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                >
                  <td className="py-2 px-3 font-mono text-xs font-bold text-[#017E84]">
                    {proj.code}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {proj.title}
                  </td>
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300 text-xs">
                    {proj.municipality}
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-xs">
                    {proj.contractor}
                  </td>
                  <td className="py-2 px-3 text-left font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {proj.budgetFormatted}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#017E84] rounded-full"
                          style={{ width: `${proj.completionRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold">
                        {proj.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded font-medium",
                        proj.completionRate >= 90
                          ? "odoo-badge-approved"
                          : proj.completionRate >= 40
                          ? "odoo-badge-pending"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {proj.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => handleInspect(proj)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-[#017E84] hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-[#017E84] bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  {proj.code}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded font-medium",
                    proj.completionRate >= 90
                      ? "odoo-badge-approved"
                      : proj.completionRate >= 40
                      ? "odoo-badge-pending"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                  )}
                >
                  {proj.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                {proj.title}
              </h3>

              <div className="space-y-1 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span>شارەوانی:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{proj.municipality}</span>
                </div>
                <div className="flex justify-between">
                  <span>بودجە:</span>
                  <span className="font-mono font-bold text-[#017E84]">{proj.budgetFormatted}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span>تەواوبوون:</span>
                  <span>{proj.completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#017E84] rounded-full"
                    style={{ width: `${proj.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <OdooCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRecordCreated={(type, data) => {
          if (type === "project") {
            setProjects((prev) => [
              {
                ...data,
                code: `PRJ-NEW-${Math.floor(10 + Math.random() * 90)}`,
                statusType: "PENDING",
                startDate: "2026/03/01",
                endDate: "2026/12/31",
                boqStage: "پێشینەی سەرەتایی",
              },
              ...prev,
            ]);
          }
        }}
      />

      <OdooInspectionModal
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
        onStatusChange={handleStatusUpdate}
      />
    </div>
  );
}
