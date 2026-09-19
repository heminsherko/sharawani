"use client";

import * as React from "react";
import {
  X,
  Plus,
  Crosshair,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";
import { createParcelAction, ParcelDTO } from "@/actions/parcels";
import { ParcelStatus } from "@prisma/client";
import {
  checkParcelOverlap,
  CADASTRE_SIMULATIONS,
  OverlapValidationResult,
} from "@/lib/gis-topology";
import { ShieldAlert } from "lucide-react";

interface MunicipalityItem {
  id: string;
  nameKrd: string;
  nameEng: string;
  isHeadquarter: boolean;
}

interface AddParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipalities: MunicipalityItem[];
  defaultMunicipalityId?: string;
  drawnPoints: [number, number][];
  onStartDrawing: () => void;
  onClearPoints: () => void;
  onSetSamplePoints: () => void;
  onSetPoints?: (points: [number, number][]) => void;
  existingParcels: ParcelDTO[];
  onSuccess: () => void;
}

export function AddParcelModal({
  isOpen,
  onClose,
  municipalities,
  defaultMunicipalityId,
  drawnPoints,
  onStartDrawing,
  onClearPoints,
  onSetSamplePoints,
  onSetPoints,
  existingParcels,
  onSuccess,
}: AddParcelModalProps) {
  const [municipalityId, setMunicipalityId] = React.useState(
    defaultMunicipalityId || (municipalities[0]?.id ?? "")
  );
  const [zoneNumber, setZoneNumber] = React.useState("کەرتی ٤ بەرانان");
  const [parcelNumber, setParcelNumber] = React.useState("142/2");
  const [areaSqm, setAreaSqm] = React.useState("300");
  const [status, setStatus] = React.useState<ParcelStatus>("VACANT");
  const [usageType, setUsageType] = React.useState("نیشتەجێبوون (Residential)");
  const [ownerName, setOwnerName] = React.useState("");
  const [ownerNationalId, setOwnerNationalId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (defaultMunicipalityId) {
      setMunicipalityId(defaultMunicipalityId);
    }
  }, [defaultMunicipalityId]);

  // Real-time spatial topology intersection calculation
  const overlapResult: OverlapValidationResult = React.useMemo(() => {
    return checkParcelOverlap(drawnPoints, existingParcels);
  }, [drawnPoints, existingParcels]);

  // Handlers for realistic Cadastre Simulations
  const handleSimulateOverlap = () => {
    const sim = CADASTRE_SIMULATIONS.OVERLAP_INTENTIONAL;
    setZoneNumber(sim.zoneNumber);
    setParcelNumber(sim.parcelNumber);
    setAreaSqm(sim.areaSqm.toString());
    setStatus(sim.status as ParcelStatus);
    setUsageType(sim.usageType);
    if (onSetPoints) {
      onSetPoints(sim.points);
    }
  };

  const handleSimulateClean = () => {
    const sim = CADASTRE_SIMULATIONS.CLEAN_SAFE;
    setZoneNumber(sim.zoneNumber);
    setParcelNumber(sim.parcelNumber);
    setAreaSqm(sim.areaSqm.toString());
    setStatus(sim.status as ParcelStatus);
    setUsageType(sim.usageType);
    if (onSetPoints) {
      onSetPoints(sim.points);
    }
  };

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Strict Topology Guard: Block submission if overlap exists
    if (overlapResult.hasOverlap) {
      setError(
        `ئاگاداری ئەندازیاری: ناتوانرێت ئەم پارچە زەوییە تۆمار بکرێت چونکە تێکەڵبوون هەیە لەگەڵ پارچە زەوی ${overlapResult.conflictingParcel?.parcelNumber}`
      );
      return;
    }

    // Validate polygon coordinates
    if (drawnPoints.length < 3) {
      setError(
        "تکایە لانیکەم ٣ خاڵی تەنسیقاتی جوگرافی (پۆلیگۆن) لەسەر نەخشە دیاریبکە، یان دوگمەی 'تەنسیقاتی نموونەیی' دابگرە."
      );
      return;
    }

    setLoading(true);

    const res = await createParcelAction({
      municipalityId,
      zoneNumber,
      parcelNumber,
      areaSqm: parseFloat(areaSqm) || 250,
      status,
      usageType,
      ownerName: ownerName.trim() || undefined,
      ownerNationalId: ownerNationalId.trim() || undefined,
      coordinates: drawnPoints,
    });

    setLoading(false);

    if (res.success) {
      onClearPoints();
      onSuccess();
      onClose();
    } else {
      setError(res.error || "هەڵەیەک ڕوویدا لە تۆمارکردنی زەوی");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                تۆمارکردنی پارچە زەوی نوێ لە GIS
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                تۆمارکردنی زانیاری کاداستری لەگەڵ کێشانی سنوری جوگرافی لەسەر نەخشە
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive text-right">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Municipality Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              شارەوانی پەیوەندیدار
            </label>
            <select
              value={municipalityId}
              onChange={(e) => setMunicipalityId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right cursor-pointer"
            >
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameKrd} {m.isHeadquarter ? "★ (مەڵبەندی گشتی)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Zone & Parcel Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ناوی کەرت / ژمارەی کەرت
              </label>
              <input
                type="text"
                value={zoneNumber}
                onChange={(e) => setZoneNumber(e.target.value)}
                placeholder="وەک: کەرتی ٤ بەرانان یان 1-Sarkawtin"
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ژمارەی پارچە زەوی (بێ دووبارەبوونەوە)
              </label>
              <input
                type="text"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                placeholder="وەک: 142/2 یان 55/1"
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
              />
            </div>
          </div>

          {/* Area, Status, and Usage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ڕووبەر (مەتری دووجا م²)
              </label>
              <input
                type="number"
                step="0.1"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                دۆخی پارچە
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ParcelStatus)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right cursor-pointer"
              >
                <option value="VACANT">بەتاڵ (Vacant - سەوز)</option>
                <option value="ALLOCATED">تەرخانکراو (Allocated - شین)</option>
                <option value="DISPUTED">
                  ناکۆک لەسەر / سەرپێچی (Disputed - سوور)
                </option>
                <option value="RESERVED">یەدەگ / خزمەتگوزاری (Reserved - زەرد)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                جۆری بەکارهێنان
              </label>
              <select
                value={usageType}
                onChange={(e) => setUsageType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right cursor-pointer"
              >
                <option value="نیشتەجێبوون (Residential)">نیشتەجێبوون</option>
                <option value="بازرگانی (Commercial)">بازرگانی</option>
                <option value="پیشەسازی (Industrial)">پیشەسازی</option>
                <option value="کشتوکاڵی (Agricultural)">کشتوکاڵی</option>
                <option value="خزمەتگوزاری گشتی (Public)">خزمەتگوزاری گشتی</option>
              </select>
            </div>
          </div>

          {/* Owner details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ناوی چواری خاوەن (ئەگەر تەرخانکراو بێت)
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="ناوی خاوەندار"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                ناسنامەی نیشتمانی / باری شارستانی
              </label>
              <input
                type="text"
                value={ownerNationalId}
                onChange={(e) => setOwnerNationalId(e.target.value)}
                placeholder="ژمارەی ناسنامە"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
              />
            </div>
          </div>

          {/* Polygon Drawing Tool on Map Section & Topology Validation */}
          <div className="rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-[#017E84]" />
                <span className="text-xs font-bold text-foreground">
                  کێشانی سنووری جوگرافی (GIS Polygon) و پشکنینی ئەندازیاری
                </span>
              </div>
              <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {drawnPoints.length} خاڵی جوگرافی دیاریکراوە
              </span>
            </div>

            {/* Topology Feedback Status Alert */}
            {overlapResult.hasOverlap ? (
              <div className="rounded-xl border border-red-500/50 bg-red-50 dark:bg-red-950/60 p-3.5 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5 shadow-xs animate-in fade-in">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1 text-right">
                  <div className="font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                    <span>⚠️ ئاگاداری تێکەڵبوونی ئەندازیاری (Cadastral Overlap Alert):</span>
                  </div>
                  <div className="leading-relaxed">
                    ناتوانرێت ئەم پارچە زەوییە تۆمار بکرێت! سنورەکەی تێکەڵ دەبێت لەگەڵ پارچە زەوی ژمارە{" "}
                    <span className="font-mono font-bold text-red-800 dark:text-red-100 px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/80 border border-red-300">
                      {overlapResult.conflictingParcel?.parcelNumber}
                    </span>{" "}
                    لە کەرتی{" "}
                    <span className="font-bold text-red-800 dark:text-red-100 px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/80 border border-red-300">
                      {overlapResult.conflictingParcel?.zoneNumber}
                    </span>
                    .
                  </div>
                </div>
              </div>
            ) : drawnPoints.length >= 3 ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  ✓ پشکنینی ئەندازیاری پەسەندە: هیچ تێکەڵبوونێکی سنور و زیادەڕۆیی لەم پارچەیەدا نییە.
                </span>
              </div>
            ) : null}

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              دەتوانیت دوگمەی کێشان دابگریت و لەسەر نەخشەی خوارەوە بە کلیک خاڵەکانی چوارچێوەی زەوییەکە دیاریبکەیت، یان یەکێک لە تاقیکردنەوە ئەندازیارییەکان هەڵبژێریت:
            </p>

            {/* Drawing & Topology Simulation Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onStartDrawing();
                  onClose(); // allow clicking on map
                }}
                className="rounded-xl bg-[#017E84] hover:bg-[#00676C] px-3 py-2 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span>دەستپێکردنی کێشان لەسەر نەخشە</span>
              </button>

              {/* Simulation 1: Intentional Overlap Test */}
              <button
                type="button"
                onClick={handleSimulateOverlap}
                className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs font-bold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="تاقیکردنەوەی تێکەڵبوون لەگەڵ پارچەی 142/12 لە کەرتی 12 شێروانە"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                <span>تاقیکردنەوەی تێکەڵبوون بە مەبەست (Test Overlap Simulation)</span>
              </button>

              {/* Simulation 2: Clean Safe Plot */}
              <button
                type="button"
                onClick={handleSimulateClean}
                className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="تاقیکردنەوەی پارچەی سەلامەت و بێ تێکەڵبوون"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>پارچەی دروست و بێ کێشە (Clean Plot Simulation)</span>
              </button>

              {drawnPoints.length > 0 && (
                <button
                  type="button"
                  onClick={onClearPoints}
                  className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>سڕینەوە</span>
                </button>
              )}
            </div>

            {drawnPoints.length > 0 && (
              <div className="rounded-xl bg-background/80 p-2 text-[10px] font-mono text-muted-foreground overflow-x-auto">
                خاڵەکان:{" "}
                {drawnPoints
                  .map(([lat, lng]) => `[${lat.toFixed(4)}, ${lng.toFixed(4)}]`)
                  .join(" -> ")}
              </div>
            )}
          </div>

          {/* Submit buttons with strict disabled guard on overlap */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={loading || overlapResult.hasOverlap || drawnPoints.length < 3}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                overlapResult.hasOverlap
                  ? "bg-red-600/70 hover:bg-red-600/70 cursor-not-allowed opacity-80"
                  : drawnPoints.length < 3
                  ? "bg-slate-400 cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
              }`}
            >
              {loading ? (
                <span>تۆماردەکرێت...</span>
              ) : overlapResult.hasOverlap ? (
                <>
                  <ShieldAlert className="h-4 w-4 text-white" />
                  <span>ناتوانرێت تۆمار بکرێت (تێکەڵبوونی سنور هەیە)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>پاشەکەوتکردن (Save / Register Parcel)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

