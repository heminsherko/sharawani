"use client";

import * as React from "react";
import {
  X,
  MapPin,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { ParcelDTO } from "@/actions/parcels";
import { ParcelStatus } from "@prisma/client";

interface ParcelDrawerProps {
  parcel: ParcelDTO | null;
  onClose: () => void;
  onOpenPermit?: (parcel: ParcelDTO) => void;
}

export function ParcelDrawer({
  parcel,
  onClose,
  onOpenPermit,
}: ParcelDrawerProps) {
  if (!parcel) return null;

  const getStatusBadge = (status: ParcelStatus) => {
    switch (status) {
      case "VACANT":
        return {
          label: "بەتاڵ (تەرخاننەکراو)",
          className: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300",
          icon: CheckCircle2,
        };
      case "ALLOCATED":
        return {
          label: "تەرخانکراو (خاوەندارێتی چەسپاو)",
          className: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300",
          icon: FileCheck,
        };
      case "DISPUTED":
        return {
          label: "ناکۆک لەسەر / سەرپێچی",
          className: "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/40 dark:text-red-300",
          icon: ShieldAlert,
        };
      case "RESERVED":
        return {
          label: "یەدەگ / خزمەتگوزاری گشتی",
          className: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-300",
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusBadge(parcel.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      {/* Semi-transparent Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Adaptive Drawer: Native Bottom Sheet on Mobile (<768px), Left Side Panel on Desktop (>=768px) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] h-auto rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 md:bottom-auto md:top-0 md:left-0 md:w-[420px] md:h-full md:max-h-none md:rounded-none md:border-r md:border-t-0 md:slide-in-from-left">
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 md:hidden shrink-0" />

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-[#F8F9FA] dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2 text-right">
            <div className="h-8 w-8 rounded-lg bg-[#714B67] text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                سەنەد و زانیاری کاداستر
              </h3>
              <span className="text-[11px] text-slate-500">
                تۆماری فەرمی شارەوانییەکانی گەرمیان
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="داخستن"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

      {/* Body Details */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right font-sans">
        {/* Status Banner */}
        <div
          className={`flex items-center justify-between rounded border p-2.5 ${statusInfo.className}`}
        >
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-bold">{statusInfo.label}</span>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold">
            {parcel.status}
          </span>
        </div>

        {/* Primary Identification Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded border border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850 p-2.5">
            <span className="text-[11px] text-slate-500 block mb-0.5">
              کەرتی کاداستر
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {parcel.zoneNumber}
            </span>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850 p-2.5">
            <span className="text-[11px] text-slate-500 block mb-0.5">
              ژمارەی پارچە
            </span>
            <span className="text-sm font-mono font-bold text-[#017E84]">
              {parcel.parcelNumber}
            </span>
          </div>
        </div>

        {/* Area & Usage */}
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {parcel.areaSqm.toLocaleString()} م²
            </span>
            <span className="text-slate-500">ڕووبەری گشتی:</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {parcel.usageType}
            </span>
            <span className="text-slate-500">جۆری بەکارهێنان:</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {parcel.municipalityName}
            </span>
            <span className="text-slate-500">شارەوانی دەسەڵاتدار:</span>
          </div>
        </div>

        {/* Ownership Information */}
        <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3 space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <User className="h-4 w-4 text-[#017E84]" />
            <span>خاوەندارێتی و دۆسیەی یاسایی</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {parcel.ownerName || "زەوی گشتی حکومەت (شارەوانی)"}
            </span>
            <span className="text-slate-500">ناوی خاوەن:</span>
          </div>

          {parcel.ownerNationalId && (
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {parcel.ownerNationalId}
              </span>
              <span className="text-slate-500">کارتی نیشتمانی:</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              {new Date(parcel.createdAt).toLocaleDateString("ku", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span>بەرواری تۆمار:</span>
          </div>
        </div>

        {/* Official Permit Action Promotion Card */}
        <div className="rounded border border-teal-200 bg-[#E2F7F2]/40 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-[#017E84] text-white flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">مۆڵەتی بیناسازی فەرمی (A4)</p>
              <p className="text-[11px] text-slate-600">دەرهێنان و چاپی بڕوانامەی مۆڵەتی بیناسازی بە مۆری فەرمی</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenPermit?.(parcel)}
            className="w-full py-1.5 px-3 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>چاپکردنی مۆڵەت (Print Permit)</span>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850 flex gap-2">
        <button
          type="button"
          onClick={() => onOpenPermit?.(parcel)}
          className="flex-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5 text-[#017E84]" />
          <span>مۆڵەتی بیناسازی</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-[#714B67] hover:bg-[#5C3C54] px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          داخستن
        </button>
      </div>
    </div>
  </>
);
}
