"use client";

import * as React from "react";
import { OdooControlPanel, OdooViewMode } from "./odoo-control-panel";
import { MetricCards } from "./metric-cards";
import { MunicipalitiesMatrix } from "./municipalities-matrix";
import { PendingDocumentsQueue } from "./pending-documents-queue";
import { ProjectsTable } from "./projects-table";
import { RevenueChart } from "./revenue-chart";
import { OdooChatter } from "./odoo-chatter";
import { OdooCreateModal } from "./odoo-create-modal";
import { OdooInspectionModal, InspectionRecord } from "./odoo-inspection-modal";
import {
  DashboardMetrics,
  MunicipalityRevenueComparison,
  DashboardProjectDTO,
  MunicipalityMatrixItem,
  PendingDocumentItem,
} from "@/actions/dashboard";
import {
  CheckCircle2,
  ChevronLeft,
  MapPin,
  Building2,
  HardHat,
  BarChart3,
  FileCheck2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToCsv } from "@/lib/export-csv";

interface DashboardViewWrapperProps {
  metrics: DashboardMetrics;
  revenueComparison: MunicipalityRevenueComparison[];
  recentProjects: DashboardProjectDTO[];
  municipalitiesMatrix: MunicipalityMatrixItem[];
  pendingDocumentQueue: PendingDocumentItem[];
  userFullName: string;
  municipalityName: string;
}

export function DashboardViewWrapper({
  metrics: initialMetrics,
  revenueComparison,
  recentProjects: initialProjects,
  municipalitiesMatrix: initialMatrix,
  pendingDocumentQueue: initialDocQueue,
  userFullName,
  municipalityName,
}: DashboardViewWrapperProps) {
  const [viewMode, setViewMode] = React.useState<OdooViewMode>("list");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Dynamic interactive state
  const [metrics, setMetrics] = React.useState(initialMetrics);
  const [projects, setProjects] = React.useState(initialProjects);
  const [matrix, setMatrix] = React.useState(initialMatrix);
  const [docQueue, setDocQueue] = React.useState(initialDocQueue);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [inspectedRecord, setInspectedRecord] = React.useState<InspectionRecord | null>(null);

  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(null);

  // Sync multi-municipality branch selection across topbar and view
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("muni");
      if (m) setSelectedBranchId(m.toLowerCase());

      const handler = (e: any) => {
        const muni = e.detail;
        if (muni && !muni.isHeadquarter) {
          setSelectedBranchId(muni.id.toLowerCase());
        } else {
          setSelectedBranchId(null);
        }
      };
      window.addEventListener("garmian-muni-changed", handler);
      return () => window.removeEventListener("garmian-muni-changed", handler);
    } catch {
      // ignore
    }
  }, []);

  // Filter matrix, projects, and documents by search & branch in real-time
  const filteredMatrix = React.useMemo(() => {
    return matrix.filter((m) => {
      if (selectedBranchId) {
        const matchBranch =
          m.id.toLowerCase().includes(selectedBranchId) ||
          m.code.toLowerCase().includes(selectedBranchId) ||
          (selectedBranchId.includes("kalar") && m.nameKrd.includes("کەلار")) ||
          (selectedBranchId.includes("kifri") && m.nameKrd.includes("کفری")) ||
          (selectedBranchId.includes("rizgari") && m.nameKrd.includes("ڕزگاری")) ||
          (selectedBranchId.includes("pebaz") && m.nameKrd.includes("باوەنوور")) ||
          (selectedBranchId.includes("sarqala") && m.nameKrd.includes("سەرقەڵا")) ||
          (selectedBranchId.includes("nawjul") && m.nameKrd.includes("نەوجول")) ||
          (selectedBranchId.includes("maydan") && m.nameKrd.includes("مەیدان")) ||
          (selectedBranchId.includes("qoratu") && m.nameKrd.includes("قۆرەتوو")) ||
          (selectedBranchId.includes("bamo") && m.nameKrd.includes("بەمۆ"));
        if (!matchBranch) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      // Check for specialized Odoo quick filters
      if (q === "پڕۆژە چالاکەکان") return m.activeProjects > 0;
      if (q === "داهاتی سەروو ٥ ملیۆن" || q === "داهاتی ئەمڕۆ") return m.dailyRevenueNumber > 5000000;
      if (q === "چەقبەستووی نوسراو") return m.documentBottlenecks > 0;

      return (
        m.nameKrd.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.tier.toLowerCase().includes(q)
      );
    });
  }, [matrix, searchQuery, selectedBranchId]);

  const filteredProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (selectedBranchId) {
        const matchBranch =
          p.municipalityName.toLowerCase().includes(selectedBranchId) ||
          (selectedBranchId.includes("kalar") && p.municipalityName.includes("کەلار")) ||
          (selectedBranchId.includes("kifri") && p.municipalityName.includes("کفری")) ||
          (selectedBranchId.includes("rizgari") && p.municipalityName.includes("ڕزگاری")) ||
          (selectedBranchId.includes("pebaz") && p.municipalityName.includes("باوەنوور"));
        if (!matchBranch) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      if (q === "پڕۆژە چالاکەکان") return p.status === "ONGOING" || p.completionRate < 100;
      if (q === "تەنها سەرپێچییەکان") return false;

      return (
        p.title.toLowerCase().includes(q) ||
        p.municipalityName.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q)
      );
    });
  }, [projects, searchQuery, selectedBranchId]);

  const filteredDocQueue = React.useMemo(() => {
    return docQueue.filter((d) => {
      if (selectedBranchId) {
        const matchBranch =
          d.senderMunicipality.toLowerCase().includes(selectedBranchId) ||
          d.receiverMunicipality.toLowerCase().includes(selectedBranchId) ||
          (selectedBranchId.includes("kalar") && (d.senderMunicipality.includes("کەلار") || d.receiverMunicipality.includes("کەلار"))) ||
          (selectedBranchId.includes("kifri") && (d.senderMunicipality.includes("کفری") || d.receiverMunicipality.includes("کفری")));
        if (!matchBranch) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      if (q === "چەقبەستووی نوسراو") return d.urgency === "VERY_URGENT" || d.urgency === "URGENT";

      return (
        d.subject.toLowerCase().includes(q) ||
        d.barcode.toLowerCase().includes(q) ||
        d.senderMunicipality.toLowerCase().includes(q)
      );
    });
  }, [docQueue, searchQuery, selectedBranchId]);

  // Handler for creating new records
  function handleRecordCreated(type: string, data: any) {
    if (type === "project") {
      setProjects((prev) => [data, ...prev]);
      setMetrics((m) => ({
        ...m,
        activeProjectsCount: m.activeProjectsCount + 1,
      }));
    } else if (type === "document") {
      setDocQueue((prev) => [data, ...prev]);
      setMetrics((m) => ({
        ...m,
        pendingApprovalsCount: m.pendingApprovalsCount + 1,
      }));
    } else if (type === "revenue") {
      const added = Number(data.amount) || 0;
      setMetrics((m) => ({
        ...m,
        todayRevenue: m.todayRevenue + added,
        todayRevenueFormatted: (m.todayRevenue + added).toLocaleString("ckb-IQ") + " دینار",
      }));
    }
  }

  // Inspection handlers
  function handleInspectMunicipality(item: MunicipalityMatrixItem) {
    setInspectedRecord({
      id: item.id,
      type: "municipality",
      title: item.nameKrd,
      codeOrBarcode: item.code,
      municipalityName: item.nameKrd,
      status: item.statusText,
      statusType: item.status === "NORMAL" ? "APPROVED" : "PENDING",
      primaryMetricLabel: "داهاتی فەرمی ئەمڕۆ",
      primaryMetricValue: item.dailyRevenueFormatted,
      secondaryMetricLabel: "پڕۆژە ئەندازیارییەکان",
      secondaryMetricValue: `${item.activeProjects} پڕۆژە`,
      details: {
        "ئاستی کارگێڕی": item.tier,
        "کۆدی دەسەڵات": item.code,
        "نوسراوی لە چاوەڕوانی واژوو": `${item.documentBottlenecks} نوسراو`,
        "پۆلێنی سەرپەرشتی": item.isHeadquarter ? "دیوانی گشتی (HQ)" : "شارەوانی لق",
      },
    });
  }

  function handleInspectProject(proj: DashboardProjectDTO) {
    setInspectedRecord({
      id: proj.id,
      type: "project",
      title: proj.title,
      codeOrBarcode: `PRJ-${proj.id.slice(-4).toUpperCase()}`,
      municipalityName: proj.municipalityName,
      status: proj.status,
      statusType: proj.completionRate >= 90 ? "APPROVED" : "PENDING",
      primaryMetricLabel: "بودجەی پڕۆژە (IQD)",
      primaryMetricValue: proj.budgetFormatted,
      secondaryMetricLabel: "ڕێژەی تەواوبوون",
      secondaryMetricValue: `${proj.completionRate}%`,
      details: {
        "کۆمپانیای بەڵێندەر": proj.contractor,
        "شارەوانی سەرپەرشتیار": proj.municipalityName,
        "دۆخی ئەندازیاری": proj.status,
        "سەرپەرشتی تاقیگەیی": "پشکنینی کۆنکرێت و قیر پەسەندکراوە",
      },
    });
  }

  function handleInspectDocument(doc: PendingDocumentItem) {
    setInspectedRecord({
      id: doc.id,
      type: "document",
      title: doc.subject,
      codeOrBarcode: doc.barcode,
      municipalityName: doc.senderMunicipality,
      status: doc.status,
      statusType: doc.status === "پەسەندکراو" ? "APPROVED" : "PENDING",
      primaryMetricLabel: "ئاستی گرنگی",
      primaryMetricValue:
        doc.urgency === "VERY_URGENT"
          ? "زۆر بەپەلە (Very Urgent)"
          : doc.urgency === "URGENT"
          ? "بەپەلە (Urgent)"
          : "ئاسایی",
      secondaryMetricLabel: "کرداری پێویست",
      secondaryMetricValue: doc.actionRequired,
      details: {
        "لایەنی نێرەر": doc.senderMunicipality,
        "لایەنی وەرگر": doc.receiverMunicipality,
        "بەرواری تۆمارکردن": doc.createdAtFormatted,
        "بارکۆدی ئەلیکترۆنی": doc.barcode,
      },
    });
  }

  function handleExportMatrixExcel() {
    const headers = [
      "کۆدی دەسەڵات",
      "ناوی شارەوانی",
      "ئاستی کارگێڕی",
      "داهاتی ئەمڕۆ (IQD)",
      "پڕۆژە ئەندازیارییەکان",
      "نوسراوە لە چاوەڕوانییەکان",
      "دۆخی خزمەتگوزاری",
    ];

    const rows = filteredMatrix.map((m) => [
      m.code,
      m.nameKrd,
      m.tier,
      m.dailyRevenueFormatted,
      m.activeProjects,
      m.documentBottlenecks,
      m.statusText,
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`garmian_municipalities_matrix_${dateStr}`, headers, rows);
  }

  return (
    <div className="space-y-4 text-right font-sans">
      {/* 1. ODOO CONTROL PANEL (Action buttons, Unified Search, Filters, View Switcher) */}
      <OdooControlPanel
        currentView={viewMode}
        onViewChange={setViewMode}
        onSearchChange={setSearchQuery}
        onNewRecord={() => setIsCreateOpen(true)}
        onExportExcel={handleExportMatrixExcel}
        title="ماتریسی سەرپەرشتیاری شارەوانییەکان"
        totalCount={filteredMatrix.length}
      />

      {/* 2. ODOO FORM SHEET WORKFLOW STATUS STEPPER */}
      <div className="bg-white dark:bg-slate-900 rounded border border-[#DEE2E6] dark:border-slate-800 p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            دۆخی خولی کارگێڕی (Workflow Stage):
          </span>
          <div className="flex items-center gap-1 font-bold text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              ڕەشنووسی سەرەتایی
            </span>
            <ChevronLeft className="h-3 w-3 text-slate-400" />
            <span className="px-2 py-0.5 rounded bg-[#FEF6E0] text-[#9A6700] border border-[#FDE6A6]">
              لەژێر پشکنین و وردبینی
            </span>
            <ChevronLeft className="h-3 w-3 text-slate-400" />
            <span className="px-2 py-0.5 rounded bg-[#E2F7F2] text-[#017E84] border border-[#B3E7DC] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>پەسەندکراوی بەڕێوەبەری گشتی</span>
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <span>بەکارهێنەری چالاک: </span>
          <strong className="text-slate-800 dark:text-slate-200">{userFullName}</strong>
          <span> • {municipalityName}</span>
        </div>
      </div>

      {/* 3. PRIMARY 4 METRIC COUNTERS */}
      <MetricCards metrics={metrics} />

      {/* VIEW MODE: MAP VIEW */}
      {viewMode === "map" && (
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#017E84]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                نەخشەی جوگرافی و کاداستری ١٣ شارەوانی ئیدارەی گەرمیان (GIS Map)
              </h2>
            </div>
            <span className="font-mono text-xs text-[#017E84] font-bold">
              13 Municipalities Georeferenced
            </span>
          </div>

          <div className="relative w-full h-96 rounded-lg bg-slate-900/90 border border-slate-700 overflow-hidden flex items-center justify-center p-6 text-center text-white">
            <div className="space-y-4 max-w-lg">
              <MapPin className="h-10 w-10 text-[#017E84] mx-auto animate-bounce" />
              <h3 className="text-base font-bold">
                تۆڕی کاداستر و زەویوزاری سنووری ئیدارەی سەربەخۆی گەرمیان
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                کەلار • کفری • ڕزگاری • باوەنوور • سەرقەڵا • نەوجول • شێخ تەویل • کۆکس • ئاوەسپی • مەیدان • قۆرەتوو • بەمۆ
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <a
                  href="/dashboard/parcels"
                  className="px-4 py-2 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-colors"
                >
                  کردنەوەی مۆدیوڵی تەواوی GIS
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: GRAPH ANALYTICS VIEW */}
      {viewMode === "graph" && (
        <div className="space-y-4">
          <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BarChart3 className="h-5 w-5 text-[#017E84]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                شیکاری بەراوردکاری داهاتی ١٣ شارەوانی (ملیۆن دیناری عێراقی)
              </h2>
            </div>
            <RevenueChart data={revenueComparison} />
          </div>
        </div>
      )}

      {/* DEFAULT / LIST & KANBAN VIEWS */}
      {(viewMode === "list" || viewMode === "kanban") && (
        <>
          {/* 4. 13 MUNICIPALITIES STATUS MATRIX (Switches between List and Kanban mode) */}
          <MunicipalitiesMatrix
            items={filteredMatrix}
            viewMode={viewMode === "kanban" ? "kanban" : "list"}
            onInspect={handleInspectMunicipality}
          />

          {/* 5. RECENT OFFICIAL DOCUMENT QUEUE (EDMS) */}
          <PendingDocumentsQueue
            queue={filteredDocQueue}
            onInspect={handleInspectDocument}
          />

          {/* 6. SECONDARY GRID: PROJECTS & REVENUE CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Projects List View */}
            <div className="lg:col-span-7">
              <ProjectsTable
                projects={filteredProjects}
                onInspect={handleInspectProject}
              />
            </div>

            {/* Revenue Analytics Chart */}
            <div className="lg:col-span-5">
              <RevenueChart data={revenueComparison} />
            </div>
          </div>
        </>
      )}

      {/* 7. ODOO CHATTER (Audit Log & Activity Notes Stream) */}
      <div className="pt-2">
        <div className="mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          مێژووی چالاکییەکان و گفتوگۆی ناوخۆیی (Odoo Chatter):
        </div>
        <OdooChatter />
      </div>

      {/* CREATE RECORD MODAL DIALOG */}
      <OdooCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRecordCreated={handleRecordCreated}
      />

      {/* RECORD INSPECTION DRAWER/MODAL */}
      <OdooInspectionModal
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
      />
    </div>
  );
}
