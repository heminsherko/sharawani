"use client";

import * as React from "react";
import {
  X,
  Barcode,
  Building,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Forward,
  Archive,
  Printer,
  FileText,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { DocumentDTO, routeDocumentAction } from "@/actions/documents";
import { DocumentStepper } from "./document-stepper";
import { RouteAction } from "@prisma/client";

interface MunicipalityOption {
  id: string;
  nameKrd: string;
}

interface DocumentDetailModalProps {
  document: DocumentDTO | null;
  onClose: () => void;
  municipalities: MunicipalityOption[];
  onActionComplete: () => void;
}

export function DocumentDetailModal({
  document,
  onClose,
  municipalities,
  onActionComplete,
}: DocumentDetailModalProps) {
  const [actionType, setActionType] = React.useState<RouteAction | null>(null);
  const [notes, setNotes] = React.useState("");
  const [targetMuniId, setTargetMuniId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!document) return null;

  async function handleExecuteAction(action: RouteAction) {
    if (!document) return;

    // For forward or reject, ask for notes
    if (action === "FORWARD" && !notes.trim()) {
      setError("تکایە هۆکار یان تێبینی ئاڕاستەکردن بنووسە.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await routeDocumentAction({
      documentId: document.id,
      action,
      notes: notes.trim() || (action === "APPROVE" ? "ڕەزامەندی درا" : "ڕەتکرایەوە"),
      targetMunicipalityId: targetMuniId || undefined,
    });

    setLoading(false);

    if (res.success) {
      setActionType(null);
      setNotes("");
      onActionComplete();
      onClose();
    } else {
      setError(res.error || "هەڵەیەک ڕوویدا لە جێبەجێکردنی بڕیاردا.");
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "VERY_URGENT":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "URGENT":
        return "bg-amber-500/10 text-amber-600 border-amber-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {document.barcode}
                </span>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getUrgencyBadge(
                    document.urgency
                  )}`}
                >
                  {document.urgency === "VERY_URGENT"
                    ? "زۆر بەپەلە"
                    : document.urgency === "URGENT"
                    ? "بەپەلە"
                    : "ئاسایی"}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground mt-0.5">
                {document.subject}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visual Transit Stepper */}
        <div className="rounded-2xl border border-border bg-background/50 p-4 mb-5">
          <p className="text-xs font-bold text-muted-foreground mb-1">
            گەشت و قۆناغەکانی گواستنەوەی نوسراو:
          </p>
          <DocumentStepper
            currentStep={document.currentStepIndex}
            status={document.status}
          />
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
          <div className="rounded-xl border border-border bg-background/60 p-3">
            <span className="text-[11px] text-muted-foreground block mb-0.5">
              شارەوانی سەرچاوە
            </span>
            <span className="font-bold text-foreground">
              {document.senderMunicipalityName}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-3">
            <span className="text-[11px] text-muted-foreground block mb-0.5">
              شارەوانی مەبەست
            </span>
            <span className="font-bold text-foreground">
              {document.destinationMunicipalityName}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-3">
            <span className="text-[11px] text-muted-foreground block mb-0.5">
              بەرواری دەرچوون
            </span>
            <span className="font-bold text-foreground">
              {new Date(document.createdAt).toLocaleDateString("ku", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Full Routing History Log */}
        <div className="rounded-2xl border border-border bg-card p-4 mb-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground border-b border-border pb-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>مێژووی ڕۆیشتن و واژووکردنی نوسراو (Audit Trail)</span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {document.routes.map((route, i) => (
              <div
                key={route.id}
                className="rounded-xl border border-border/70 bg-background/80 p-3 text-xs space-y-1"
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
                  <p className="text-[11px] text-muted-foreground bg-accent/30 p-2 rounded-lg mt-1">
                    {route.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Official Action Control Section */}
        {document.status !== "ARCHIVED" && document.status !== "REJECTED" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                دەسەڵاتی بڕیاردان و ئاڕاستەکردنی بەرپرس
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                هەنگاوی کارگێڕی
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* If Forward action is chosen, show note and target inputs */}
            {actionType === "FORWARD" && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">
                    ئاڕاستەکردن بۆ شارەوانی
                  </label>
                  <select
                    value={targetMuniId}
                    onChange={(e) => setTargetMuniId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground text-right"
                  >
                    <option value="">هەڵبژاردنی شارەوانی...</option>
                    {municipalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nameKrd}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground block">
                    تێبینی و ڕێنمایی لێکۆڵینەوە
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ڕێنمایی بۆ لیژنە یان شارەوانی مەبەست..."
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground text-right"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleExecuteAction("FORWARD")}
                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    {loading ? "دەگوازرێتەوە..." : "پشتڕاستکردنەوەی ئاڕاستەکردن"}
                  </button>
                </div>
              </div>
            )}

            {/* If Reject is chosen, show rejection note input */}
            {actionType === "REJECT" && (
              <div className="space-y-2 pt-1 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-destructive block">
                    هۆکاری یاسایی یان کارگێڕی ڕەتکردنەوە
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="هۆکاری ڕەتکردنەوە بنووسە..."
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs text-foreground text-right"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleExecuteAction("REJECT")}
                    className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500"
                  >
                    {loading ? "تۆماردەکرێت..." : "پشتڕاستکردنەوەی ڕەتکردنەوە"}
                  </button>
                </div>
              </div>
            )}

            {/* Standard Action Buttons */}
            {!actionType && (
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleExecuteAction("APPROVE")}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md hover:bg-emerald-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>ڕەزامەندم (Approve)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("FORWARD")}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Forward className="h-4 w-4" />
                  <span>ئاڕاستەکردن بۆ لێکۆڵینەوە</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("REJECT")}
                  className="rounded-xl bg-red-600 px-4 py-2.5 min-h-[44px] text-xs font-bold text-white shadow-md hover:bg-red-500 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  <span>ڕەتکرایەوە (Reject)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>چاپکردنی پسولەی بارکۆد</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/80"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
}

