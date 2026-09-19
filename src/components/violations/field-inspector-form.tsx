"use client";

import * as React from "react";
import {
  Camera,
  MapPin,
  Crosshair,
  Building,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Upload,
  Trash2,
  ArrowRight,
  Sparkles,
  Radio,
  FileText,
  UserX,
} from "lucide-react";
import { submitViolationAction } from "@/actions/violations";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MunicipalityOption {
  id: string;
  nameKrd: string;
  isHeadquarter: boolean;
}

interface FieldInspectorFormProps {
  userMunicipalityId: string;
  userMunicipalityName: string;
  isHeadquarter: boolean;
  municipalities: MunicipalityOption[];
  inspectorName: string;
}

export function FieldInspectorForm({
  userMunicipalityId,
  userMunicipalityName,
  isHeadquarter,
  municipalities,
  inspectorName,
}: FieldInspectorFormProps) {
  const router = useRouter();

  const [municipalityId, setMunicipalityId] = React.useState(userMunicipalityId);
  const [zone, setZone] = React.useState("");
  const [offenderName, setOffenderName] = React.useState("");
  const [description, setDescription] = React.useState("");

  // GPS Geolocation State
  const [latitude, setLatitude] = React.useState<number | null>(null);
  const [longitude, setLongitude] = React.useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = React.useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = React.useState(false);
  const [gpsError, setGpsError] = React.useState<string | null>(null);

  // Photo Capture State
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [photoName, setPhotoName] = React.useState<string | null>(null);

  // Submission State
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successId, setSuccessId] = React.useState<string | null>(null);

  // 1. Live GPS Geolocation Capture using Navigator API
  const handleCaptureGPS = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("ئامێرەکەت پشتگیری GPS ناکات. دەتوانیت تەنسیقاتی ناوچەکە بنووسیت.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      (err) => {
        console.warn("GPS Geolocation error:", err);
        // Fallback friendly message
        setGpsError("دەستگەیشتن بە GPS ڕێگەنەدرا. دەتوانیت تەنسیقاتی مەیدانی دابنێیت.");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Fallback button to set field coordinates near Kalar/Kifri if on desktop or GPS denied
  const handleSetSampleGarmianGPS = () => {
    setLatitude(34.6315);
    setLongitude(45.3128);
    setGpsAccuracy(5);
    setGpsError(null);
  };

  // 2. Camera photo handler
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!latitude || !longitude) {
      setError("تکایە سەرەتا دوگمەی 'وەرگرتنی خێرای GPS' دابگرە بۆ تۆمارکردنی شوێن.");
      return;
    }

    if (!description.trim()) {
      setError("تکایە وەسفی سەرپێچییەکە بنووسە.");
      return;
    }

    setLoading(true);

    const res = await submitViolationAction({
      municipalityId,
      zone: zone.trim() || "کەرتی گشتی",
      offenderName: offenderName.trim() || undefined,
      description: description.trim(),
      latitude,
      longitude,
      accuracy: gpsAccuracy || undefined,
      photoName: photoName || undefined,
    });

    setLoading(false);

    if (res.success && res.parcelId) {
      setSuccessId(res.parcelId);
    } else {
      setError(res.error || "هەڵەیەک ڕوویدا لە کاتی ناردنی ڕاپۆرت.");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 text-right pb-16">
      {/* Mobile Top App Bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground">
              تۆماری مەیدانی زیادەڕۆیی
            </h1>
            <p className="text-[10px] text-muted-foreground">
              تیمی چاودێری مەیدانی شارەوانییەکان
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/parcels"
          className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent inline-flex items-center gap-1"
        >
          <MapPin className="h-3.5 w-3.5 text-red-600" />
          <span>نەخشەی GIS</span>
        </Link>
      </div>

      {/* Success Alert Banner (Red Alert Dispatched) */}
      {successId ? (
        <div className="rounded-3xl border-2 border-red-500 bg-red-50 dark:bg-red-950/40 p-6 text-center space-y-4 shadow-xl animate-in zoom-in-95">
          <div className="h-16 w-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
            <Radio className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="inline-block rounded-full bg-red-600 text-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              RED ALERT DISPATCHED
            </span>
            <h2 className="text-lg font-black text-red-900 dark:text-red-100">
              سەرپێچی بە سەرکەوتوویی تۆمارکرا!
            </h2>
            <p className="text-xs text-red-800 dark:text-red-200 leading-relaxed max-w-md mx-auto">
              ڕاپۆرتەکەت ڕاستەوخۆ بە ڕەنگی سووری ئاگادارکەرەوە لەسەر نەخشەی GISی
              بەڕێوەبەری گشتی و بەشی زیادەڕۆیی جێگیرکرا.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
            <Link
              href="/dashboard/parcels"
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <MapPin className="h-4 w-4" />
              <span>بینین لەسەر نەخشەی سوور (GIS)</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessId(null);
                setZone("");
                setOffenderName("");
                setDescription("");
                setPhotoPreview(null);
                setLatitude(null);
                setLongitude(null);
              }}
              className="rounded-xl border border-red-300 dark:border-red-800 bg-card px-4 py-2.5 text-xs font-bold hover:bg-accent"
            >
              تۆمارکردنی حاڵەتێکی نوێ
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* 1. Municipality (Auto-locked to Inspector's town) */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-sm">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isHeadquarter ? "دەسەڵاتی مەڵبەندی گشتی" : "دەسەڵاتی فەرمی چاودێر"}
              </span>
              <span className="flex items-center gap-1.5">
                <span>شارەوانی پەیوەندیدار</span>
                <Building className="h-3.5 w-3.5 text-red-600" />
              </span>
            </label>

            {isHeadquarter ? (
              <select
                value={municipalityId}
                onChange={(e) => setMunicipalityId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none text-right cursor-pointer"
              >
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameKrd}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-muted/30 border border-border/80 px-3.5 py-2.5 text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  قوفڵکراوە بۆ سنووری خۆت
                </span>
                <span className="font-bold text-foreground">
                  {userMunicipalityName}
                </span>
              </div>
            )}
          </div>

          {/* 2. Live GPS Capture (HTML5 Geolocation API) */}
          <div className="rounded-2xl border border-red-500/20 bg-red-50/30 dark:bg-red-950/20 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400">
                <Radio className="h-4 w-4 animate-pulse" />
                <span>شوێنگەی ڕاستەوخۆ (Live GPS Location)</span>
              </div>
              {latitude && (
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                  ڕێژەی هەڵە: ±{gpsAccuracy || 4}م
                </span>
              )}
            </div>

            {latitude && longitude ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-right font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  className="text-[11px] font-bold text-emerald-700 underline"
                >
                  نوێکردنەوە
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  disabled={gpsLoading}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-500 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Crosshair
                    className={`h-4 w-4 ${gpsLoading ? "animate-spin" : ""}`}
                  />
                  <span>
                    {gpsLoading
                      ? "وەرگرتنی تەنسیقاتی مانگی دەستکرد..."
                      : "وەرگرتنی خێرای تەنسیقات لە مۆبایلەوە (GPS)"}
                  </span>
                </button>

                {gpsError && (
                  <p className="text-[11px] text-destructive text-right">
                    {gpsError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSetSampleGarmianGPS}
                  className="w-full text-center text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>دانانی تەنسیقاتی مەیدانی (گەرمیان)</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Camera Capture / Photo Upload */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-sm">
            <label className="text-xs font-bold text-foreground flex items-center justify-end gap-1.5">
              <span>وێنەی مەیدانی سەرپێچی (Camera Capture)</span>
              <Camera className="h-3.5 w-3.5 text-red-600" />
            </label>

            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-border aspect-video">
                {/* Preview Thumbnail */}
                <img
                  src={photoPreview}
                  alt="Violation evidence"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoName(null);
                  }}
                  className="absolute top-2 left-2 rounded-xl bg-black/60 p-2 text-white hover:bg-black/80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-5 text-center cursor-pointer hover:border-red-500 hover:bg-accent/20 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-11 w-11 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    کلیک بکە بۆ گرتنی وێنە بە کامێرا
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    بۆ بەڵگەی یاسایی و خستنەسەر دۆسیەی کاداستر
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* 4. Violation Details */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-sm">
            {/* Zone / Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                کەرت یان شوێنی دیاریکراو
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="وەک: سەر شەقامی سەرەکی، کۆڵانی ١٤ بەرانان"
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none text-right"
              />
            </div>

            {/* Offender Name (if known) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  (ئەگەر ناسراو بێت)
                </span>
                <span>ناوی زیادەڕۆیکار</span>
              </label>
              <input
                type="text"
                value={offenderName}
                onChange={(e) => setOffenderName(e.target.value)}
                placeholder="ناوی کەس یان کۆمپانیای سەرپێچیکار"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:border-red-500 focus:outline-none text-right"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                وەسفی زیادەڕۆیی و ڕاپۆرتی چاودێر
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وەک: دەستپێکردنی بیناکردنی بێ مۆڵەت لەسەر موڵکی گشتی و بەستنی شۆستە بە بلۆک..."
                required
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-red-500 focus:outline-none text-right"
              />
            </div>
          </div>

          {/* Fixed / Large Bottom Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-sm font-black text-white shadow-xl shadow-red-600/30 hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>دەنێردرێت و ڕاگەیاندنی سوور دەرچوو...</span>
              ) : (
                <>
                  <Radio className="h-5 w-5" />
                  <span>تۆمارکردن و ناردنی ئاگاداری بەپەلە (RED ALERT)</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

