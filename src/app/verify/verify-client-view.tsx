"use client";

import * as React from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Printer,
  Copy,
  Check,
  Search,
  ExternalLink,
  Lock,
  QrCode,
  FileCheck2,
  Calendar,
  MapPin,
  User,
  Layers,
  ArrowRight,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

interface PermitVerificationData {
  docType: string;
  docNumber: string;
  municipalityName: string;
  ownerName: string;
  nationalId: string;
  zoneNumber: string;
  parcelNumber: string;
  areaSqm: number;
  buildingSpecs: string;
  statusText: string;
  issueDate: string;
  signatory: string;
  securityClearance: string;
  hash: string;
}

interface VerifyClientViewProps {
  initialData: PermitVerificationData;
}

export function VerifyClientView({ initialData }: VerifyClientViewProps) {
  const [data, setData] = React.useState<PermitVerificationData>(initialData);
  const [copied, setCopied] = React.useState(false);
  const [searchDoc, setSearchDoc] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyHash = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(data.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDoc.trim()) return;
    window.location.href = `/verify?doc=${encodeURIComponent(searchDoc.trim())}`;
  };

  const shortHash = `${data.hash.slice(0, 8)}...${data.hash.slice(-8)}`;

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-[#017E84] selection:text-white"
    >
      {/* 1. TOP OFFICIAL GOVERNMENT EMBLEM HEADER */}
      <header className="w-full bg-[#714B67] text-white border-b border-[#5C3C54] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          {/* Emblem and Titles */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-xs shrink-0">
              <Building2 className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 tracking-wide">
                حکومەتی هەرێمی کوردستان • ئیدارەی سەربەخۆی گەرمیان
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
              </h1>
              <div className="text-[11px] text-slate-200">
                پۆرتاڵی گشتیی پشکنین و سەلماندنی بەڵگەنامەی فەرمی (Public Verification)
              </div>
            </div>
          </div>

          {/* Quick Access to ERP Login / Home */}
          <div className="flex items-center gap-2 print:hidden">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5 text-amber-300" />
              <span>چوونەژوورەوەی فەرمانبەران</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* LARGE ANIMATED VERIFICATION BADGE */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 p-5 sm:p-6 shadow-lg text-center">
          {/* Subtle Background Rings */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          {/* Animated Glowing Emerald Icon */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <span className="absolute h-16 w-16 rounded-full bg-emerald-500/25 animate-ping" />
            <div className="relative h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>
          </div>

          {/* Verification Title */}
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-100 flex items-center justify-center gap-2 flex-wrap">
            <span>✓ بەڵگەنامەی فەرمی و متمانەپێکراو</span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
              OFFICIALLY VERIFIED & AUTHENTIC
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-1 max-w-xl mx-auto leading-relaxed">
            ئەم بەڵگەنامەیە خاوەنی مۆری دیجیتاڵیی چەسپاوە، بە فەرمی لە سیستەمی کاداستری گشتی شارەوانییەکانی گەرمیان تۆمارکراوە و تەواوی زانیارییەکانی یاسایی و دروستن.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>پلەی پاراستنی ئەلیکترۆنی: {data.securityClearance}</span>
          </div>
        </div>

        {/* 3. STRUCTURED FORMAL VERIFICATION CARD */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
          {/* Floating Security Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] select-none">
            <div className="text-center font-bold text-2xl sm:text-3xl -rotate-12">
              سیستەمی یەکگرتووی شارەوانییەکانی گەرمیان - GMS Enterprise
            </div>
          </div>

          {/* Card Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-850 flex items-center justify-between flex-wrap gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-[#017E84]" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                وردەکاریی تۆماری یاسایی بەڵگەنامە
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-[#714B67] bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
              {data.docNumber}
            </span>
          </div>

          {/* Key-Value Parameter Grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs relative z-10">
            {/* جۆری بەڵگەنامە */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <FileCheck2 className="h-3.5 w-3.5 text-[#017E84]" />
                <span>جۆری بەڵگەنامە:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {data.docType}
              </p>
            </div>

            {/* ژمارەی مۆڵەت */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <QrCode className="h-3.5 w-3.5 text-[#017E84]" />
                <span>ژمارەی فەرمیی مۆڵەت:</span>
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                {data.docNumber}
              </p>
            </div>

            {/* دەسەڵاتی دەرکەر */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-[#714B67]" />
                <span>دەسەڵاتی دەرکەر:</span>
              </span>
              <p className="font-bold text-[#714B67] dark:text-[#a8749c] text-sm">
                {data.municipalityName}
              </p>
            </div>

            {/* ناوی خاوەن موڵک */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-[#017E84]" />
                <span>ناوی خاوەن موڵک:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {data.ownerName}
              </p>
              <p className="text-[10px] font-mono text-slate-500">
                ناسنامە: {data.nationalId}
              </p>
            </div>

            {/* کەرت و پارچە */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#017E84]" />
                <span>کەرت و ژمارەی پارچە زەوی:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                پارچەی <span className="font-mono text-[#017E84]">{data.parcelNumber}</span> • {data.zoneNumber}
              </p>
            </div>

            {/* ڕووبەری تەرخانکراو */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-[#017E84]" />
                <span>ڕووبەری تەرخانکراو و بیناسازی:</span>
              </span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                <span className="font-mono">{data.areaSqm}</span> مەتری دووجا (م²)
              </p>
              <p className="text-[10px] text-slate-500">
                {data.buildingSpecs}
              </p>
            </div>

            {/* ڕێکەوتی واژۆکردن */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#017E84]" />
                <span>ڕێکەوتی دەرچوون و واژۆکردن:</span>
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {data.issueDate}
              </p>
            </div>

            {/* دۆخی یاسایی */}
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>دۆخی یاسایی:</span>
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                <span>{data.statusText}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Signature Banner */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-[#FAFBFD] dark:bg-slate-850 space-y-2 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  شفرەی ئاسایشی دیجیتاڵی (SHA-256 Verification Hash)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                {data.signatory}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <code className="font-mono text-xs text-[#017E84] break-all select-all font-semibold">
                {data.hash}
              </code>
              <button
                type="button"
                onClick={handleCopyHash}
                className="shrink-0 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                title="لەبەرگرتنەوەی کۆد"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 text-[10px]">کۆپیکرا</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[10px]">کۆپی</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Mobile QR Verification Box */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white shadow-xs shrink-0">
                <QRCodeSVG
                  value={currentUrl || `https://garmian.gov.krd/verify?doc=${data.parcelNumber}`}
                  size={76}
                  level="H"
                />
              </div>
              <div className="text-right space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  سکانی مۆبایل و بەستەری ڕاستەوخۆ
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  هەر هاوڵاتی یان دەزگایەکی حکومی دەتوانێت بە کامێرای مۆبایل ئەم کۆدە سکان بکات بۆ بینینی ڕەسەنایەتی.
                </div>
              </div>
            </div>

            {/* Action buttons: Download PDF / Print */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>داگرتنی کۆپیی ڕەسەن (Download PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. VERIFY ANOTHER DOCUMENT SEARCH SECTION */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs print:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-[#017E84]" />
              <span>پشکنینی بەڵگەنامەیەکی تر:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Search by Parcel or Permit No.
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              placeholder="ژمارەی پارچە یان مۆڵەت بنووسە (وەک: 142/12 یان 512/8)..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-[#017E84] focus:ring-1 focus:ring-[#017E84] outline-none text-right"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#5C3C54] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              پشکنین
            </button>
          </form>

          {/* Quick Demo links */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
            <span>نموونەی ڕاستەقینە:</span>
            <button
              type="button"
              onClick={() => (window.location.href = "/verify?doc=142/12")}
              className="text-[#017E84] font-mono hover:underline cursor-pointer"
            >
              [142/12 شێروانە]
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/verify?doc=512/8")}
              className="text-[#017E84] font-mono hover:underline cursor-pointer"
            >
              [512/8 شەهیدان]
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/verify?doc=88/4")}
              className="text-[#017E84] font-mono hover:underline cursor-pointer"
            >
              [88/4 بۆلیڤارد]
            </button>
          </div>
        </div>
      </main>

      {/* 5. OFFICIAL FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-3xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            سیستەمی کاداستر و زانیاری جوگرافیی بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            Garmian Municipalities General Directorate • Cryptographic Verification Portal v2.0
          </p>
        </div>
      </footer>
    </div>
  );
}

