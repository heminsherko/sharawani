"use client";

import * as React from "react";
import {
  Search,
  Barcode,
  Building2,
  FileCheck,
  Clock,
  Printer,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { trackPublicDocumentAction, DocumentDTO } from "@/actions/documents";
import { DocumentStepper } from "@/components/edms/document-stepper";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";

export default function PublicTrackPage() {
  const [barcode, setBarcode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [document, setDocument] = React.useState<DocumentDTO | null>(null);
  const [searched, setSearched] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent, customBarcode?: string) {
    if (e) e.preventDefault();
    const query = (customBarcode || barcode).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const result = await trackPublicDocumentAction(query);
      if (result) {
        setDocument(result);
      } else {
        setDocument(null);
        setError("هیچ نوسراوێک یان مامەڵەیەک بەم بارکۆدە نەدۆزرایەوە. تکایە دڵنیابەرەوە لە دروستی ژمارەی سەر پسولەکەت.");
      }
    } catch (err: any) {
      setError("هەڵەیەک ڕوویدا لە پەیوەندی لەگەڵ سێرڤەر.");
    } finally {
      setLoading(false);
    }
  }

  const handleTestBarcode = (testCode: string) => {
    setBarcode(testCode);
    handleSearch(undefined, testCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100 dark:from-slate-950 dark:via-amber-950/10 dark:to-slate-900 py-10 px-4 md:px-8 text-right">
      {/* Top Navbar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-foreground">
              شارەوانییەکانی گەرمیان
            </h1>
            <p className="text-[11px] text-muted-foreground">
              دەروازەی خزمەتگوزاری گشتی هاوڵاتییان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
          >
            چوونەژوورەوەی فەرمانبەران
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
            <Barcode className="h-3.5 w-3.5" />
            <span>سیستەمی یەکگرتووی بەدواداچوونی نوسراوی فەرمی</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            بەدواداچوونی بارکۆدی مامەڵە و نوسراوەکان
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            هاوڵاتی بەڕێز، ژمارەی بارکۆدی سەر پسولەکەت لێرە بنووسە بۆ زانینی قۆناغ و
            باری ئێستای مامەڵەکەت لەنێوان شارەوانییەکانی گەرمیان.
          </p>
        </div>

        {/* Barcode Search Form */}
        <div className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-xl backdrop-blur-md">
          <form onSubmit={(e) => handleSearch(e)} className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-amber-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loading ? (
                <span>لێکۆڵینەوە...</span>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>بەدواداچوون</span>
                </>
              )}
            </button>
            <div className="relative flex-1">
              <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="نموونە: GDM-2026-004128"
                required
                className="w-full rounded-2xl border border-border bg-background py-3 pr-12 pl-4 text-sm font-mono font-bold text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none text-right"
              />
            </div>
          </form>

          {/* Quick Demo Barcodes for Testing */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/60 text-xs">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              بارکۆدی نموونەیی بۆ تاقیکردنەوە:
            </span>
            <button
              type="button"
              onClick={() => handleTestBarcode("GM-2026-004128")}
              className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
            >
              GM-2026-004128
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Document Tracking Results Card */}
        {document && (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-5">
              <div>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  {document.barcode}
                </span>
                <h3 className="text-base md:text-lg font-bold text-foreground mt-0.5">
                  {document.subject}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>تۆمارکراوی فەرمی</span>
                </span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="text-xs font-bold text-foreground mb-1">
                قۆناغەکانی گەیشتنی مامەڵەکەت:
              </p>
              <DocumentStepper
                currentStep={document.currentStepIndex}
                status={document.status}
              />
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-2xl border border-border bg-background/60 p-3.5">
                <span className="text-[11px] text-muted-foreground block mb-1">
                  شارەوانی سەرچاوە
                </span>
                <span className="font-bold text-foreground">
                  {document.senderMunicipalityName}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-3.5">
                <span className="text-[11px] text-muted-foreground block mb-1">
                  شوێنی مەبەست
                </span>
                <span className="font-bold text-foreground">
                  {document.destinationMunicipalityName}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-3.5">
                <span className="text-[11px] text-muted-foreground block mb-1">
                  بەرواری ناردن
                </span>
                <span className="font-bold text-foreground">
                  {new Date(document.createdAt).toLocaleDateString("ku", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Step-by-Step History Log */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground border-b border-border pb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>مێژووی ڕۆیشتن و تۆماری کارگێڕی</span>
              </div>

              <div className="space-y-2.5">
                {document.routes.map((route, i) => (
                  <div
                    key={route.id}
                    className="rounded-2xl border border-border/80 bg-background/80 p-3.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">
                        {route.fromUserName} ({route.fromUserRole})
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(route.routedAt).toLocaleTimeString("ku", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(route.routedAt).toLocaleDateString("ku", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {route.notes && (
                      <p className="text-[11px] text-muted-foreground bg-accent/30 p-2 rounded-xl mt-1">
                        {route.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Print Certificate Button */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-accent flex items-center gap-2 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>چاپکردنی بەڵگەنامەی بەدواداچوون</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

