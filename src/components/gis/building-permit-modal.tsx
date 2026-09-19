"use client";

import * as React from "react";
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Building2,
  ExternalLink,
  Shield,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ParcelDTO } from "@/actions/parcels";
import { generateDocumentSignature } from "@/lib/digital-signature";

interface BuildingPermitModalProps {
  parcel: ParcelDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BuildingPermitModal({
  parcel,
  isOpen,
  onClose,
}: BuildingPermitModalProps) {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen || !parcel) return null;

  const permitNumber = `GDM-BLD-2026-${parcel.parcelNumber.replace(/\//g, "").slice(0, 4) || "0841"}`;
  const todayDate = "2026/09/19";

  // Generate dynamic cryptographic digital signature
  const signatureData = generateDocumentSignature({
    docNumber: permitNumber,
    parcelNumber: parcel.parcelNumber,
    zoneNumber: parcel.zoneNumber,
    ownerName: parcel.ownerName,
    areaSqm: parcel.areaSqm,
    municipalityName: parcel.municipalityName,
    date: todayDate,
  });

  const handleCopyHash = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(signatureData.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none overflow-y-auto">
      {/* Modal Container */}
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto text-right font-sans"
        dir="rtl"
      >
        {/* Web UI Action Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-[#714B67] text-white flex items-center justify-center shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                مۆڵەتی بیناسازی فەرمی (A4 Building Permit Certificate)
              </h2>
              <p className="text-xs text-slate-500">
                بەپێی ڕێنماییە ئەندازیاری و ژینگەییەکانی شارەوانییەکانی گەرمیان
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>چاپکردنی بەڵگەنامەی فەرمی (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE A4 AREA: Official Government Certificate Layout */}
        <div
          id="official-permit-print-area"
          className="relative p-8 sm:p-10 bg-white text-slate-900 space-y-6 print:p-0 print:m-0 print:w-full print:shadow-none font-sans border-4 border-double border-slate-800 m-4 rounded"
        >
          {/* Subtle Institutional Watermark Background */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035] overflow-hidden">
            <Building2 className="w-[450px] h-[450px] text-slate-900" />
          </div>

          {/* 1. Official Government Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between text-xs relative z-10">
            {/* Right: KRG & Ministry */}
            <div className="text-right space-y-1">
              <p className="font-bold text-slate-900 text-sm">حکومەتی هەرێمی کوردستان</p>
              <p className="font-bold text-slate-800">ئیدارەی سەربەخۆی گەرمیان</p>
              <p className="text-slate-700">بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان</p>
              <p className="font-bold text-[#714B67]">{parcel.municipalityName}</p>
            </div>

            {/* Center: Emblem & Title */}
            <div className="text-center space-y-1">
              <div className="inline-flex h-12 w-12 rounded-full border-2 border-slate-800 items-center justify-center bg-slate-50 mb-1 shadow-xs">
                <Building2 className="h-6 w-6 text-[#714B67]" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950">
                مۆڵەتی دروستکردنی باڵەخانە و بیناسازی
              </h1>
              <span className="inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 font-mono text-[11px] font-bold text-slate-800">
                OFFICIAL MUNICIPAL BUILDING PERMIT
              </span>
            </div>

            {/* Left: Permit Number & Date */}
            <div className="text-left space-y-1 font-mono text-xs">
              <p>
                <span className="font-sans text-slate-600">ژمارەی مۆڵەت: </span>
                <strong className="text-slate-950 text-sm">{permitNumber}</strong>
              </p>
              <p>
                <span className="font-sans text-slate-600">بەرواری دەرچوون: </span>
                <strong>{todayDate}</strong>
              </p>
              <p>
                <span className="font-sans text-slate-600">ماوەی ڕێگەپێدراو: </span>
                <strong className="font-sans">٣ ساڵی ڕۆژژمێری</strong>
              </p>
            </div>
          </div>

          {/* 2. Official Preamble */}
          <div className="bg-[#F8F9FA] border border-slate-200 rounded p-3 text-xs leading-relaxed text-slate-800 relative z-10">
            پاڵپشت بە یاسای بەڕێوەبردنی شارەوانییەکان لە هەرێمی کوردستان و ڕەزامەندی بەشی ئەندازە، نەخشەسازی و
            کاداستری کەرتی، ئەم مۆڵەتە فەرمییە درا بە خاوەن موڵک بۆ دەستپێکردنی کارەکانی بیناسازی بەپێی تایبەتمەندییە دیاریکراوەکان:
          </div>

          {/* 3. Structured Formal Record Table */}
          <div className="rounded border border-slate-300 overflow-hidden text-xs relative z-10">
            <table className="w-full text-right border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-700 w-1/4 border-l border-slate-200">
                    ناوی خاوەن موڵک
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-950 w-1/4 border-l border-slate-200 text-sm">
                    {parcel.ownerName || "هاوڵاتی خاوەن ماف"}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 w-1/4 border-l border-slate-200">
                    ژمارەی کارتی نیشتمانی
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-950 w-1/4">
                    {parcel.ownerNationalId || "198900456123"}
                  </td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    کەرتی کاداستر (Zone)
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-l border-slate-200">
                    {parcel.zoneNumber}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    ژمارەی پارچە زەوی (Parcel)
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#017E84] text-sm">
                    {parcel.parcelNumber}
                  </td>
                </tr>

                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    ڕووبەری تەرخانکراو
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-l border-slate-200 text-sm">
                    {parcel.areaSqm} م²
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    جۆری بەکارهێنان
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {parcel.usageType}
                  </td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    بەرزیی ڕێپێدراو (نهۆم)
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-l border-slate-200">
                    G + 2 (زەمینی + دوو نهۆم)
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    پاشەکشەی شەقام (Setback)
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    ٢ مەتر لە ڕووی شەقام
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    شارەوانی دەسەڵاتدار
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-l border-slate-200">
                    {parcel.municipalityName}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700 border-l border-slate-200">
                    دۆخی یاسایی زەوی
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-mono text-xs">
                      {parcel.status === "ALLOCATED" ? "تاپۆکراوی بێ‌کێشە" : "تۆمارکراوی فەرمی"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4. Environmental & Safety Conditions */}
          <div className="space-y-1.5 text-xs text-slate-700 relative z-10">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#017E84]" />
              <span>مەرجەکانی ژینگە، بیناسازی و سەلامەتی شارەوانی:</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 pr-2 text-[11px] leading-relaxed text-slate-600">
              <li>پابەندبوون بە تەواوی نەخشە ئەندازیارییە پەسەندکراوەکانی شارەوانی لەلایەن ئەندازیاری سەرپەرشتیار.</li>
              <li>دانانی پەرژینی سەلامەتی لە دەوروبەری شوێنی کارکردن و ڕێگریکردن لە گیرانی شۆستە و شەقامە گشتییەکان.</li>
              <li>ڕشتن و فڕێدانی پاشماوەی بیناسازی تەنها لە شوێنە ڕێگەپێدراوەکانی بەڕێوەبەرایەتی ژینگەی گەرمیان.</li>
              <li>دروستکردنی بەربەستی ئاوەڕۆ بە هاوئاهەنگی لەگەڵ هێڵی ئاوەڕۆی لوولەیی شارەوانی.</li>
            </ul>
          </div>

          {/* 5. Security & Verification Section (Stamp, QR, Digital Signatures) */}
          <div className="pt-5 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            {/* Left: Dynamic QR Code & Live Online Verification Portal Link */}
            <div className="flex flex-col items-center sm:items-start gap-1.5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded border-2 border-slate-900 bg-white shadow-xs">
                  <QRCodeSVG value={signatureData.verificationUrl} size={82} level="H" />
                </div>
                <div className="text-right space-y-0.5">
                  <span className="font-mono text-[10px] font-bold text-slate-700 block tracking-wider">
                    VERIFIED BY KRG CADASTRE
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-950 block">
                    *{permitNumber}*
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 inline" />
                    <span>بەڵگەنامەی فەرمی و متمانەپێکراو</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono block">
                    Secured by SHA-256 Engine
                  </span>
                </div>
              </div>

              {/* Clickable button under QR code: Instant online verification */}
              <a
                href={signatureData.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 print:hidden inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#017E84] hover:bg-[#00676C] px-3 py-1 rounded shadow-xs transition-colors cursor-pointer"
                title="کلیک بکە بۆ بینینی پۆرتاڵی فەرمیی پشکنین"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>پشکنینی ڕاستیی مۆڵەت (Verify Online)</span>
              </a>
            </div>

            {/* Center: Official Golden-Teal Municipal Stamp */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="h-28 w-28 rounded-full border-4 border-double border-[#017E84] flex flex-col items-center justify-center text-center p-1.5 bg-amber-50/40 rotate-2 shadow-xs">
                <span className="font-bold text-[8px] text-[#714B67] uppercase tracking-tight">
                  حکومەتی هەرێمی کوردستان
                </span>
                <span className="font-bold text-[9px] text-[#017E84] leading-tight my-0.5">
                  مۆری ئەلیکترۆنیی پەسەندکراو
                </span>
                <span className="text-[8px] text-slate-800 font-bold">
                  {parcel.municipalityName}
                </span>
                <span className="font-mono text-[7px] text-amber-700 font-bold mt-0.5">
                  ★ GARMIAN-GOV-2026 ★
                </span>
              </div>
            </div>

            {/* Right: Cryptographic Digital Signature Block */}
            <div className="text-right sm:text-left space-y-1">
              <p className="text-xs font-bold text-slate-900">
                واژۆکراوی فەرمیی: بەڕێوەبەری گشتی شارەوانییەکانی گەرمیان
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                <Shield className="h-3 w-3 text-emerald-600" />
                <span className="font-semibold">{signatureData.securityClearance}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                ڕێکەوتی واژۆ: {signatureData.timestamp}
              </p>

              <div className="h-9 border-b border-dotted border-slate-400 w-52 flex items-end justify-start sm:justify-center pb-0.5">
                <span className="font-mono text-[11px] text-[#714B67] font-bold italic">
                  [واژووی ئەلیکترۆنی چەسپاو]
                </span>
              </div>

              {/* Cryptographic Hash display with copy button */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  SHA256: {signatureData.shortHash}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="print:hidden p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="لەبەرگرتنەوەی تەواوی کۆدی شفرەی دیجیتاڵی"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
