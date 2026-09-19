"use client";

import * as React from "react";
import {
  X,
  FilePlus,
  Barcode,
  Upload,
  Building,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { createDocumentAction } from "@/actions/documents";
import { DocumentUrgency } from "@prisma/client";

interface MunicipalityOption {
  id: string;
  nameKrd: string;
  isHeadquarter: boolean;
}

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipalities: MunicipalityOption[];
  onSuccess: (barcode: string) => void;
}

export function CreateDocumentModal({
  isOpen,
  onClose,
  municipalities,
  onSuccess,
}: CreateDocumentModalProps) {
  const [subject, setSubject] = React.useState("");
  const [urgency, setUrgency] = React.useState<DocumentUrgency>("NORMAL");
  const [destinationId, setDestinationId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [previewBarcode, setPreviewBarcode] = React.useState("GDM-2026-....");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setPreviewBarcode(`GDM-${year}-${rand}`);

      // Default destination to General Directorate if available
      const hq = municipalities.find((m) => m.isHeadquarter);
      if (hq) {
        setDestinationId(hq.id);
      } else if (municipalities[0]) {
        setDestinationId(municipalities[0].id);
      }
    }
  }, [isOpen, municipalities]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("تکایە بابەتی نوسراوەکە بنووسە.");
      return;
    }
    if (!destinationId) {
      setError("تکایە شارەوانی مەبەست دیاریبکە.");
      return;
    }

    setLoading(true);

    const res = await createDocumentAction({
      subject,
      urgency,
      destinationMunicipalityId: destinationId,
      notes,
      fileName: fileName || undefined,
    });

    setLoading(false);

    if (res.success && res.barcode) {
      onSuccess(res.barcode);
      onClose();
    } else {
      setError(res.error || "هەڵەیەک ڕوویدا لە دروستکردنی نوسراو.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FilePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                دەرکردن و ناردنی نوسراوی فەرمی (EDMS)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                دروستکردنی نوسراوی ئەلیکترۆنی بێ کاغەز لەنێوان شارەوانییەکاندا
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
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive text-right">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Auto-generated Barcode Banner */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 flex items-center justify-between">
            <div className="text-right">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                کۆدی بەدواداچوون و بارکۆدی فەرمی سیستەم
              </span>
              <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                {previewBarcode}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-1.5 shadow-sm">
              <Barcode className="h-5 w-5 text-muted-foreground" />
              <span className="text-[11px] font-mono font-bold">Auto-Gen</span>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              بابەتی نوسراوی فەرمی
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="وەک: داواکاری تەرخانکردنی بودجەی پڕۆژەی قیرتاوکردن"
              required
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none text-right"
            />
          </div>

          {/* Urgency Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              ئاستی گرنگی و خێرایی (Urgency Level)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency("NORMAL")}
                className={`rounded-xl border p-2.5 text-xs font-bold text-center transition-all ${
                  urgency === "NORMAL"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                ئاسایی (Normal)
              </button>
              <button
                type="button"
                onClick={() => setUrgency("URGENT")}
                className={`rounded-xl border p-2.5 text-xs font-bold text-center transition-all ${
                  urgency === "URGENT"
                    ? "border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                بەپەلە (Urgent)
              </button>
              <button
                type="button"
                onClick={() => setUrgency("VERY_URGENT")}
                className={`rounded-xl border p-2.5 text-xs font-bold text-center transition-all ${
                  urgency === "VERY_URGENT"
                    ? "border-red-500 bg-red-500/10 text-red-600 shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                زۆر بەپەلە (Very Urgent)
              </button>
            </div>
          </div>

          {/* Destination Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              ئاڕاستەکردن بۆ (شوێنی مەبەست)
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-amber-500 focus:outline-none text-right cursor-pointer"
            >
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameKrd} {m.isHeadquarter ? "★ (مەڵبەندی گشتی گەرمیان)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload (PDF Attachment) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              هاوپێچکردنی فایلی نوسراو (PDF)
            </label>
            <div className="relative rounded-2xl border-2 border-dashed border-border p-4 text-center hover:border-amber-500 transition-colors bg-muted/10">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-1.5">
                {fileName ? (
                  <>
                    <FileCheck className="h-7 w-7 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600">
                      {fileName}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      فایلی PDF بە سەرکەوتوویی هاوپێچکرا
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-7 w-7 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">
                      کلیک بکە بۆ دیاریکردنی فایلی PDF یان ڕایبکێشە ئێرە
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      قەبارەی پەڕاو تا 20 مێگابایت ڕێگەپێدراوە
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes / Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              تێبینی و ڕوونکردنەوەی سەرەتایی
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تێبینی بنووسە ئەگەر پێویستە..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-amber-500 focus:outline-none text-right"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-accent"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-500 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <span>دەنێردرێت...</span>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>دەرکردن و ناردنی فەرمی</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

