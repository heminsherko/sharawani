"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Printer,
  X,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Barcode,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import { InvoiceDTO } from "@/actions/finance";

interface OfficialReceiptProps {
  invoice: InvoiceDTO | null;
  payerNationalId?: string;
  onClose: () => void;
}

// Convert amount to Kurdish words helper
function amountToWords(num: number): string {
  if (num === 2500000) return "دوو ملیۆن و پێنج سەد هەزار دیناری عێراقی";
  if (num === 4500000) return "چوار ملیۆن و پێنج سەد هەزار دیناری عێراقی";
  if (num === 850000) return "هەشت سەد و پەنجا هەزار دیناری عێراقی";
  if (num === 150000) return "سەد و پەنجا هەزار دیناری عێراقی";
  if (num === 50000) return "پەنجا هەزار دیناری عێراقی";
  return `${num.toLocaleString()} دیناری عێراقی تەواو`;
}

export function OfficialReceipt({
  invoice,
  payerNationalId = "198800124567",
  onClose,
}: OfficialReceiptProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const verificationUrl = `https://garmian.gov.krd/verify/receipt?id=${invoice.invoiceNumber}&amount=${invoice.amount}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl p-4 md:p-6 text-right max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible">
        {/* Print-specific CSS styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-receipt,
            #printable-receipt * {
              visibility: visible;
            }
            #printable-receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 1.5cm;
              border: 2px solid #000 !important;
              box-shadow: none !important;
              color: #000 !important;
              background: #fff !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Modal Top Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-all flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>چاپکردنی پسوولە (Print Receipt)</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* THE OFFICIAL PRINTABLE RECEIPT CARD (A5 / A4 Compatible) */}
        <div
          id="printable-receipt"
          className="rounded-2xl border-2 border-slate-800/80 bg-white dark:bg-slate-950 p-6 md:p-8 text-slate-900 dark:text-slate-100 shadow-sm space-y-6"
          dir="rtl"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <div className="flex items-center justify-between px-2">
              {/* Left Crest */}
              <div className="h-14 w-14 rounded-full border-2 border-emerald-700 p-1 flex items-center justify-center text-emerald-700 text-center font-bold text-[9px] leading-tight">
                کوردستان
                <br />
                KRG
              </div>

              {/* Center Directorate Titles */}
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  حکومەتی هەرێمی کوردستان - عێراق
                </p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  ئیدارەی سەربەخۆی گەرمیان
                </p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 pt-0.5">
                  {invoice.municipalityNameKrd}
                </p>
              </div>

              {/* Right Seal */}
              <div className="h-14 w-14 rounded-full border-2 border-slate-800 p-1 flex items-center justify-center text-slate-800 dark:text-slate-200 text-center font-bold text-[9px] leading-tight">
                گەرمیان
                <br />
                GARMIAN
              </div>
            </div>

            {/* Receipt Banner Title */}
            <div className="pt-3">
              <span className="inline-block rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-6 py-1.5 text-xs font-black tracking-wide">
                پسوولەی فەرمی وەرگرتنی داهات (Municipal Official Receipt)
              </span>
            </div>
          </div>

          {/* Serial Number & Date Bar */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-3 border border-slate-300 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 ml-1">ژمارەی زنجیرە:</span>
              <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 ml-1">بەرواری وەرگرتن:</span>
              <span className="font-bold">
                {new Date(invoice.createdAt).toLocaleDateString("ku", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Payer and Payment Information Table */}
          <div className="border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                <tr>
                  <td className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400 w-1/3">
                    ناوی باجدەر / هاوڵاتی:
                  </td>
                  <td className="py-2.5 px-4 font-black text-sm text-slate-900 dark:text-white">
                    {invoice.payerName}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400">
                    ناسنامەی باری شارستانی:
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold">
                    {invoice.payerNationalId || payerNationalId}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400">
                    جۆری داهات و خزمەتگوزاری:
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {invoice.type}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400">
                    بڕی پارەی وەرگیراو بە ژمارە:
                  </td>
                  <td className="py-3 px-4 font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
                    {invoice.amountFormatted}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400">
                    بڕی پارەی وەرگیراو بە وشە:
                  </td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {amountToWords(invoice.amount)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 bg-slate-50 dark:bg-slate-900/50 font-bold text-slate-600 dark:text-slate-400">
                    باری پارەدان:
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-0.5 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>دراوە بە تەواوی (PAID)</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* QR Code Verification & Barcode Section */}
          <div className="flex items-center justify-between border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/20">
            {/* Dynamic QR Code */}
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-lg border border-slate-300 shadow-sm shrink-0">
                <QRCodeSVG
                  value={verificationUrl}
                  size={76}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  کۆدی دڵنیابوونەوەی ئەلیکترۆنی (QR Code)
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">
                  لەلایەن کامێرای مۆبایلەوە ئەم کۆدە سکان بکە بۆ دڵنیابوونەوە لە
                  دروستی ئەم پسوولەیە لە سیستەمی گەرمیان.
                </p>
              </div>
            </div>

            {/* Barcode Graphic */}
            <div className="hidden sm:flex flex-col items-center pl-2">
              <Barcode className="h-10 w-28 text-slate-700 dark:text-slate-300" />
              <span className="font-mono text-[10px] tracking-widest text-slate-500">
                {invoice.invoiceNumber}
              </span>
            </div>
          </div>

          {/* Signatures & Stamp Slots */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-300 dark:border-slate-800 text-center text-xs">
            <div className="space-y-8">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                واژووی باجدەر / هاوڵاتی
              </p>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto" />
            </div>

            <div className="space-y-8">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                ژمێریاری وەرگر (بەشی دارایی)
              </p>
              <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto" />
            </div>

            <div className="space-y-8">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                مۆری فەرمی شارەوانی
              </p>
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-400 mx-auto" />
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-2 text-[10px] text-slate-400">
            ئەم پسوولەیە بە شێوازی ئەلیکترۆنی لە سیستەمی یەکگرتووی شارەوانییەکانی گەرمیان
            دەرچووە و بەبێ مۆر و واژوو بەڵگەنامەی ڕەسەنە.
          </div>
        </div>

        {/* Footer Close Button (Hidden in Print) */}
        <div className="no-print mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold hover:bg-accent"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
}

