"use client";

import * as React from "react";
import {
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  Crosshair,
  FileSpreadsheet,
  Printer,
  Eye,
  Building2,
  Filter,
  Maximize2,
  Table as TableIcon,
  Map as MapIcon,
  Layers,
} from "lucide-react";
import GarmianMap from "./dynamic-map";
import { ParcelDrawer } from "./parcel-drawer";
import { AddParcelModal } from "./add-parcel-modal";
import { BuildingPermitModal } from "./building-permit-modal";
import { ParcelDTO, getParcelsAction } from "@/actions/parcels";
import { ParcelStatus } from "@prisma/client";
import { exportToCsv } from "@/lib/export-csv";
import { cn } from "@/lib/utils";
import {
  checkParcelOverlap,
  CADASTRE_SIMULATIONS,
  OverlapValidationResult,
} from "@/lib/gis-topology";

interface MunicipalityItem {
  id: string;
  nameKrd: string;
  nameEng: string;
  isHeadquarter: boolean;
}

interface GISClientViewProps {
  initialParcels: ParcelDTO[];
  municipalities: MunicipalityItem[];
  userMunicipalityId?: string;
  isHeadquarter: boolean;
}

type QuickFilterType = "ALL" | "RESIDENTIAL" | "COMMERCIAL" | "VIOLATION";

export function GISClientView({
  initialParcels,
  municipalities,
  userMunicipalityId,
  isHeadquarter,
}: GISClientViewProps) {
  const [parcels, setParcels] = React.useState<ParcelDTO[]>(initialParcels);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [quickFilter, setQuickFilter] = React.useState<QuickFilterType>("ALL");
  const [selectedParcel, setSelectedParcel] = React.useState<ParcelDTO | null>(null);
  const [permitParcel, setPermitParcel] = React.useState<ParcelDTO | null>(null);
  const [branchFilter, setBranchFilter] = React.useState<string | null>(null);

  // Sync with global multi-municipality context
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const m = params.get("muni");
      if (m) setBranchFilter(m.toLowerCase());

      const handler = (e: any) => {
        const muni = e.detail;
        if (muni && !muni.isHeadquarter) {
          setBranchFilter(muni.id.toLowerCase());
        } else {
          setBranchFilter(null);
        }
      };
      window.addEventListener("garmian-muni-changed", handler);
      return () => window.removeEventListener("garmian-muni-changed", handler);
    } catch {
      // ignore
    }
  }, []);

  // Drawing mode state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [drawingMode, setDrawingMode] = React.useState(false);
  const [drawnPoints, setDrawnPoints] = React.useState<[number, number][]>([]);

  // Real-time spatial topology intersection validation
  const overlapResult: OverlapValidationResult = React.useMemo(() => {
    return checkParcelOverlap(drawnPoints, parcels);
  }, [drawnPoints, parcels]);

  // Quick Simulation Handlers for Topology Overlap Testing
  const handleSimulateOverlap = () => {
    setDrawnPoints(CADASTRE_SIMULATIONS.OVERLAP_INTENTIONAL.points);
  };

  const handleSimulateClean = () => {
    setDrawnPoints(CADASTRE_SIMULATIONS.CLEAN_SAFE.points);
  };

  // Filter parcels based on branch, search query & quick filter buttons:
  // [هەموو زەوییەکان], [نیشتەجێ], [بازرگانی], [سەرپێچییەکان]
  const filteredParcels = React.useMemo(() => {
    return parcels.filter((p) => {
      if (branchFilter) {
        const matchBranch =
          p.municipalityId.toLowerCase().includes(branchFilter) ||
          p.municipalityName.toLowerCase().includes(branchFilter) ||
          (branchFilter.includes("kalar") && p.municipalityName.includes("کەلار")) ||
          (branchFilter.includes("kifri") && p.municipalityName.includes("کفری")) ||
          (branchFilter.includes("rizgari") && p.municipalityName.includes("ڕزگاری"));
        if (!matchBranch) return false;
      }

      let matchFilter = true;
      if (quickFilter === "RESIDENTIAL") {
        matchFilter =
          p.usageType.includes("نیشتەجێ") || p.status === "ALLOCATED";
      } else if (quickFilter === "COMMERCIAL") {
        matchFilter =
          p.usageType.includes("بازرگانی") || p.status === "RESERVED";
      } else if (quickFilter === "VIOLATION") {
        matchFilter =
          p.usageType.includes("سەرپێچی") ||
          p.usageType.includes("زیادەڕۆیی") ||
          p.status === "DISPUTED";
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.parcelNumber.toLowerCase().includes(q) ||
        p.zoneNumber.toLowerCase().includes(q) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(q)) ||
        p.municipalityName.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [parcels, quickFilter, searchQuery, branchFilter]);

  // Statistics counts for quick badges
  const stats = React.useMemo(() => {
    const total = parcels.length;
    const residential = parcels.filter(
      (p) => p.usageType.includes("نیشتەجێ") || p.status === "ALLOCATED"
    ).length;
    const commercial = parcels.filter(
      (p) => p.usageType.includes("بازرگانی") || p.status === "RESERVED"
    ).length;
    const violations = parcels.filter(
      (p) =>
        p.usageType.includes("سەرپێچی") ||
        p.usageType.includes("زیادەڕۆیی") ||
        p.status === "DISPUTED"
    ).length;
    return { total, residential, commercial, violations };
  }, [parcels]);

  // Bi-directional sync: When parcel is selected on map, scroll table row into view
  React.useEffect(() => {
    if (selectedParcel) {
      const el = document.getElementById(`parcel-row-${selectedParcel.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedParcel]);

  // Handle table row click: Selects parcel, triggers map flyTo, highlights outline, opens drawer
  function handleSelectParcel(parcel: ParcelDTO) {
    setSelectedParcel(parcel);
  }

  // Point clicked on map during drawing
  const handlePointAdded = (point: [number, number]) => {
    setDrawnPoints((prev) => [...prev, point]);
  };

  // Generate sample polygon near Kalar center
  const handleSetSamplePoints = () => {
    const sample: [number, number][] = [
      [34.6325, 45.3125],
      [34.6345, 45.3128],
      [34.6348, 45.3150],
      [34.6328, 45.3148],
    ];
    setDrawnPoints(sample);
  };

  const handleRefreshData = async () => {
    try {
      const res = await getParcelsAction();
      setParcels(res.parcels);
    } catch (err) {
      console.error("Failed to refresh parcels:", err);
    }
  };

  // Excel (CSV) export with Kurdish UTF-8 BOM
  const handleExportExcel = () => {
    const headers = [
      "ژمارەی پارچە",
      "کەرتی کاداستر",
      "شارەوانی دەسەڵاتدار",
      "ڕووبەر (م²)",
      "جۆری بەکارهێنان",
      "دۆخی یاسایی",
      "ناوی خاوەن موڵک",
      "ژمارەی کارتی نیشتمانی",
      "بەرواری تۆمارکردن",
    ];

    const rows = filteredParcels.map((p) => [
      p.parcelNumber,
      p.zoneNumber,
      p.municipalityName,
      p.areaSqm,
      p.usageType,
      p.status === "ALLOCATED"
        ? "تەرخانکراو (خاوەندارێتی چەسپاو)"
        : p.status === "VACANT"
        ? "بەتاڵ (موڵکی گشتی)"
        : p.status === "DISPUTED"
        ? "سەرپێچی / ناکۆک"
        : "یەدەگ / خزمەتگوزاری گشتی",
      p.ownerName || "زەوی گشتی حکومەت",
      p.ownerNationalId || "-",
      new Date(p.createdAt).toLocaleDateString("ku"),
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`garmian_cadastre_parcels_${dateStr}`, headers, rows);
  };

  return (
    <div className="flex flex-col space-y-3 font-sans pb-12" dir="rtl">
      {/* 1. TOP ODOO CONTROL BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
        {/* Right side in RTL: Title and Jurisdiction */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-[#714B67] text-white flex items-center justify-center shadow-xs shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>سیستەمی کاداستری زەویوزار و نەخشەی GIS</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                Web-GIS Cadastre
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {isHeadquarter
                ? "دەسەڵاتی مەڵبەندی گشتی: پیشاندانی تەواوی ١٣ شارەوانی ئیدارەی گەرمیان"
                : "سنووردارکراو بە سنووری شارەوانی دەسەڵاتدار"}
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Parcel & Export to Excel */}
        <div className="flex items-center gap-2">
          {/* Export to Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="odoo-btn-secondary flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="هەناردەکردنی داتا بۆ فایلی ئێکسڵ بە کۆدکردنی فەرمی کوردی UTF-8"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>هەناردەکردن بۆ ئێکسڵ (Export)</span>
          </button>

          {/* Add Parcel Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="odoo-btn-primary flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>تۆماری پارچەی نوێ</span>
          </button>
        </div>
      </div>

      {/* 2. MAP FILTER BAR & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850 p-2.5">
        {/* Quick Filter Buttons: [هەموو زەوییەکان], [نیشتەجێ], [بازرگانی], [سەرپێچییەکان] */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-[#017E84]" />
            <span>فلتەری نەخشە:</span>
          </span>

          <button
            type="button"
            onClick={() => setQuickFilter("ALL")}
            className={cn(
              "px-3 py-1 text-xs rounded font-bold transition-all cursor-pointer",
              quickFilter === "ALL"
                ? "bg-[#714B67] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            )}
          >
            هەموو زەوییەکان ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter("RESIDENTIAL")}
            className={cn(
              "px-3 py-1 text-xs rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              quickFilter === "RESIDENTIAL"
                ? "bg-[#2563eb] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-blue-50"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            <span>نیشتەجێ ({stats.residential})</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter("COMMERCIAL")}
            className={cn(
              "px-3 py-1 text-xs rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              quickFilter === "COMMERCIAL"
                ? "bg-[#d97706] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-amber-50"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            <span>بازرگانی ({stats.commercial})</span>
          </button>

          <button
            type="button"
            onClick={() => setQuickFilter("VIOLATION")}
            className={cn(
              "px-3 py-1 text-xs rounded font-bold flex items-center gap-1.5 transition-all cursor-pointer",
              quickFilter === "VIOLATION"
                ? "bg-[#dc2626] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 text-red-700 dark:text-red-400 border border-slate-200 dark:border-slate-700 hover:bg-red-50"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
            <span>سەرپێچییەکان ({stats.violations})</span>
          </button>
        </div>

        {/* Search Input Box */}
        <div className="relative min-w-[240px] max-w-sm">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەپێی پارچە، کەرت، شارەوانی یان خاوەن..."
            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-1 pr-8 pl-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#017E84] focus:ring-1 focus:ring-[#017E84] outline-none text-right"
          />
        </div>
      </div>

      {/* 3. DRAWING MODE HELPER & SIMULATION BANNER */}
      {drawingMode && (
        <div className="space-y-2 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-teal-400 bg-teal-50 dark:bg-teal-950/40 p-2.5 text-right">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
              <Crosshair className="h-4 w-4 text-[#017E84] animate-spin" />
              <span>
                دۆخی دیاریکردنی سنووری زەوی: کلیک لەسەر نەخشە بکە ({drawnPoints.length} خاڵ دانراوە)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Simulation 1: Overlap */}
              <button
                type="button"
                onClick={handleSimulateOverlap}
                className="rounded border border-red-300 bg-red-50 dark:bg-red-950/60 px-2 py-1 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 cursor-pointer flex items-center gap-1 shadow-xs"
                title="تاقیکردنەوەی بەریەککەوتنی ئەندازیاری لەگەڵ پارچەی 142/12"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                <span>تاقیکردنەوەی تێکەڵبوون بە مەبەست</span>
              </button>

              {/* Simulation 2: Clean */}
              <button
                type="button"
                onClick={handleSimulateClean}
                className="rounded border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer flex items-center gap-1 shadow-xs"
                title="تاقیکردنەوەی پارچەی سەلامەت و پاک"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>پارچەی دروست و بێ کێشە</span>
              </button>

              <button
                type="button"
                onClick={handleSetSamplePoints}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                تەنسیقاتی نموونەیی
              </button>
              {drawnPoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDrawnPoints([])}
                  className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 cursor-pointer"
                >
                  سڕینەوە
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setDrawingMode(false);
                  setIsAddModalOpen(true);
                }}
                disabled={drawnPoints.length < 3 || overlapResult.hasOverlap}
                className={`rounded px-3 py-1 text-xs font-bold text-white transition-all ${
                  overlapResult.hasOverlap
                    ? "bg-red-600/70 hover:bg-red-600/70 cursor-not-allowed opacity-80"
                    : drawnPoints.length < 3
                    ? "bg-slate-400 cursor-not-allowed opacity-60"
                    : "bg-[#017E84] hover:bg-[#00676C] cursor-pointer"
                }`}
              >
                {overlapResult.hasOverlap
                  ? "تەواوکردن (تێکەڵبوون هەیە - قفڵکراوە)"
                  : "تەواوکردن و پڕکردنەوەی فۆڕم"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawingMode(false);
                  setDrawnPoints([]);
                }}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>

          {/* REAL-TIME COLLISION ALERT BANNER RIGHT ABOVE THE MAP */}
          {overlapResult.hasOverlap ? (
            <div className="rounded border-2 border-red-500 bg-red-50 dark:bg-red-950/80 p-3 shadow-md text-right text-xs font-bold text-red-900 dark:text-red-200 animate-in fade-in flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-red-800 dark:text-red-200 flex items-center gap-1.5">
                    <span>⚠️ ئاگاداری تێکەڵبوونی ئەندازیاری (Cadastral Overlap Alert):</span>
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100 uppercase">
                    Collision Detected
                  </span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  ناتوانرێت ئەم پارچە زەوییە تۆمار بکرێت! سنورەکەی تێکەڵ دەبێت لەگەڵ پارچە زەوی ژمارە{" "}
                  <span className="font-mono font-bold text-red-800 dark:text-red-200 px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/80 border border-red-300 underline">
                    {overlapResult.conflictingParcel?.parcelNumber}
                  </span>{" "}
                  لە کەرتی{" "}
                  <span className="font-bold text-red-800 dark:text-red-200 px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/80 border border-red-300">
                    {overlapResult.conflictingParcel?.zoneNumber}
                  </span>
                  . دوگمەی تۆمارکردن و پاشەکەوتکردن بە تەواوی قفڵکراوە بەهۆی پاراستنی سنوری کاداستر.
                </p>
              </div>
            </div>
          ) : drawnPoints.length >= 3 ? (
            <div className="rounded border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 p-2.5 shadow-xs text-right text-xs font-bold text-emerald-900 dark:text-emerald-200 animate-in fade-in flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  ✓ پشکنینی ئەندازیاری پەسەندە: هیچ تێکەڵبوونێکی سنور و زیادەڕۆیی لەم پارچەیەدا نییە.
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 uppercase">
                Valid Cadastre
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* 4. WEB-GIS INTERACTIVE MAP CONTAINER */}
      <div
        className="relative h-[480px] sm:h-[560px] md:h-[650px] w-full rounded border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
      >
        <GarmianMap
          parcels={filteredParcels}
          onSelectParcel={handleSelectParcel}
          selectedParcelId={selectedParcel?.id}
          drawingMode={drawingMode}
          drawnPoints={drawnPoints}
          onPointAdded={handlePointAdded}
          hasOverlap={overlapResult.hasOverlap}
          conflictingParcelId={overlapResult.conflictingParcel?.id || null}
        />

        {/* Map Legend Floating Box (Hidden on extra small mobile to save space) */}
        <div className="hidden sm:block absolute bottom-4 right-4 z-[400] rounded border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2.5 shadow-lg backdrop-blur-xs text-right text-xs space-y-1.5 pointer-events-auto">
          <span className="font-bold text-[11px] text-slate-500 block border-b border-slate-200 dark:border-slate-800 pb-1">
            ڕێبەری ڕەنگەکانی کاداستری گەرمیان
          </span>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
              سەوزایی و باخچە (پارکی ڕووباری سیروان)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
              نیشتەجێبوون (شەهیدان و کەرتی ١٢ شێروانە)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
              بازرگانی (شەقامی سەرەکی بۆلیڤارد)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-slate-800 dark:text-slate-200 text-[11px]">
              سەرپێچی و زیادەڕۆیی لەسەر زەوی گشتی
            </span>
          </div>
        </div>
      </div>

      {/* 5. DENSE ODOO DATA TABLE & MOBILE KANBAN (BI-DIRECTIONAL SYNC) */}
      <div className="rounded border border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Table Title Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-[#017E84] text-white flex items-center justify-center shadow-xs">
              <TableIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>تۆماری خشتەیی پارچە زەوییەکان</span>
                <span className="font-mono text-[11px] text-[#017E84] font-bold">
                  ({filteredParcels.length} تۆمار)
                </span>
              </h3>
            </div>
          </div>

          <div className="hidden sm:block text-xs text-slate-500">
            کلیک لە هەر ڕیزێک بکە بۆ فڕینی کامێرای نەخشە و پێشاندانی وردەکاری
          </div>
        </div>

        {/* Desktop Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-800 select-none">
              <tr className="h-9 text-xs font-semibold uppercase tracking-wider">
                <th className="py-2 px-3">ژمارەی پارچە</th>
                <th className="py-2 px-3">کەرتی کاداستر</th>
                <th className="py-2 px-3">شارەوانی دەسەڵاتدار</th>
                <th className="py-2 px-3 text-center">ڕووبەر (م²)</th>
                <th className="py-2 px-3">جۆری بەکارهێنان</th>
                <th className="py-2 px-3 text-center">دۆخی یاسایی</th>
                <th className="py-2 px-3">خاوەن موڵک</th>
                <th className="py-2 px-3 text-center">کرداری فەرمی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredParcels.map((parcel) => {
                const isSelected = parcel.id === selectedParcel?.id;

                return (
                  <tr
                    key={parcel.id}
                    id={`parcel-row-${parcel.id}`}
                    onClick={() => handleSelectParcel(parcel)}
                    className={cn(
                      "h-10 cursor-pointer transition-colors even:bg-[#FAFAFB] dark:even:bg-slate-850/40",
                      isSelected
                        ? "bg-[#E2F7F2] font-semibold border-r-4 border-r-[#017E84]"
                        : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-xs text-[#017E84]">
                      {parcel.parcelNumber}
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-800 dark:text-slate-200">
                      {parcel.zoneNumber}
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-600 dark:text-slate-400">
                      {parcel.municipalityName}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {parcel.areaSqm.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-800 dark:text-slate-200">
                      {parcel.usageType}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {parcel.status === "ALLOCATED" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          تەرخانکراو
                        </span>
                      ) : parcel.status === "VACANT" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          بەتاڵ (گشتی)
                        </span>
                      ) : parcel.status === "DISPUTED" ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          سەرپێچی
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          یەدەگ
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-xs text-slate-700 dark:text-slate-300">
                      {parcel.ownerName || "زەوی گشتی"}
                    </td>
                    <td
                      className="py-2 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View in drawer */}
                        <button
                          type="button"
                          onClick={() => handleSelectParcel(parcel)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                          title="دیاریکردن لەسەر نەخشە"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Print Permit Button */}
                        <button
                          type="button"
                          onClick={() => setPermitParcel(parcel)}
                          className="px-2 py-1 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          title="چاپکردنی مۆڵەتی بیناسازی فەرمی (A4)"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>مۆڵەت</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Odoo Kanban Card View */}
        <div className="block md:hidden p-2.5 space-y-2.5">
          {filteredParcels.map((parcel) => {
            const isSelected = parcel.id === selectedParcel?.id;
            return (
              <div
                key={parcel.id}
                onClick={() => handleSelectParcel(parcel)}
                className={cn(
                  "p-3 rounded-lg border bg-white dark:bg-slate-850 shadow-xs transition-all active:scale-[0.99] cursor-pointer space-y-2",
                  isSelected
                    ? "border-[#017E84] ring-2 ring-[#017E84]/20 bg-[#E2F7F2]/40"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#017E84]">
                    پارچە {parcel.parcelNumber}
                  </span>
                  {parcel.status === "ALLOCATED" ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      تەرخانکراو
                    </span>
                  ) : parcel.status === "VACANT" ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      بەتاڵ (گشتی)
                    </span>
                  ) : parcel.status === "DISPUTED" ? (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                      سەرپێچی
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      یەدەگ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">کەرت و شارەوانی</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {parcel.zoneNumber} - {parcel.municipalityName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ڕووبەر و بەکارهێنان</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {parcel.areaSqm.toLocaleString()} م²
                    </span>{" "}
                    <span className="text-slate-500">({parcel.usageType})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                    {parcel.ownerName || "زەوی گشتی حکومەت"}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleSelectParcel(parcel)}
                      className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 min-h-[36px]"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#017E84]" />
                      <span>نەخشە</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermitParcel(parcel)}
                      className="px-2.5 py-1.5 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold flex items-center gap-1 min-h-[36px]"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>مۆڵەت</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. DETAIL DRAWER */}
      <ParcelDrawer
        parcel={selectedParcel}
        onClose={() => setSelectedParcel(null)}
        onOpenPermit={(p) => setPermitParcel(p)}
      />

      {/* 7. PRINTABLE OFFICIAL A4 BUILDING PERMIT MODAL */}
      <BuildingPermitModal
        parcel={permitParcel}
        isOpen={!!permitParcel}
        onClose={() => setPermitParcel(null)}
      />

      {/* 8. ADD NEW PARCEL MODAL */}
      <AddParcelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        municipalities={municipalities}
        defaultMunicipalityId={userMunicipalityId}
        drawnPoints={drawnPoints}
        onStartDrawing={() => {
          setDrawingMode(true);
        }}
        onClearPoints={() => setDrawnPoints([])}
        onSetSamplePoints={handleSetSamplePoints}
        onSetPoints={(pts) => setDrawnPoints(pts)}
        existingParcels={parcels}
        onSuccess={handleRefreshData}
      />
    </div>
  );
}
