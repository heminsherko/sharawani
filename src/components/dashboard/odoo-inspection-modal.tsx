"use client";

import * as React from "react";
import {
  X,
  Printer,
  CheckCircle2,
  XCircle,
  Send,
  Building2,
  HardHat,
  FileText,
  MapPin,
  CreditCard,
  ChevronLeft,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OdooChatter } from "./odoo-chatter";

export interface InspectionRecord {
  id: string;
  type: "municipality" | "project" | "document" | "parcel" | "receipt";
  title: string;
  codeOrBarcode: string;
  municipalityName: string;
  status: string;
  statusType?: "NORMAL" | "APPROVED" | "PENDING" | "REJECTED";
  primaryMetricLabel?: string;
  primaryMetricValue?: string;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string;
  assignedOfficer?: string;
  dateFormatted?: string;
  notes?: string;
  details?: Record<string, string>;
}

interface OdooInspectionModalProps {
  record: InspectionRecord | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: string, statusType: "APPROVED" | "REJECTED" | "PENDING") => void;
}

type PipelineStage = "DRAFT" | "IN_REVIEW" | "APPROVED" | "ARCHIVED";

export function OdooInspectionModal({
  record,
  onClose,
  onStatusChange,
}: OdooInspectionModalProps) {
  const [currentStatus, setCurrentStatus] = React.useState(record?.status || "");
  const [stage, setStage] = React.useState<PipelineStage>("IN_REVIEW");
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (record) {
      setCurrentStatus(record.status);
      if (record.status.includes("پەسەند") || record.statusType === "APPROVED") {
        setStage("APPROVED");
      } else if (record.status.includes("تەواو") || record.status.includes("ئەرشیف")) {
        setStage("ARCHIVED");
      } else {
        setStage("IN_REVIEW");
      }
      setActionFeedback(null);
    }
  }, [record]);

  if (!record) return null;

  function handleApprove() {
    const newStatus = "پەسەندکراوی فەرمی (Approved)";
    setCurrentStatus(newStatus);
    setStage("APPROVED");
    setActionFeedback("تۆمارەکە بە سەرکەوتوویی پەسەندکرا لەلایەن بەڕێوەبەرایەتی.");
    onStatusChange?.(record!.id, newStatus, "APPROVED");
  }

  function handleReject() {
    const newStatus = "ڕەتکرایەوە (Rejected)";
    setCurrentStatus(newStatus);
    setStage("DRAFT");
    setActionFeedback("تۆمارەکە ڕەتکرایەوە و گەڕێندرایەوە بۆ قۆناغی ڕەشنووس.");
    onStatusChange?.(record!.id, newStatus, "REJECTED");
  }

  function handleForward() {
    const newStatus = "ئاڕاستەکراوە بۆ دیوانی گشتی (Forwarded)";
    setCurrentStatus(newStatus);
    setStage("IN_REVIEW");
    setActionFeedback("تۆمارەکە ئاڕاستەی دیوانی گشتی کرا بۆ وردبینی.");
    onStatusChange?.(record!.id, newStatus, "PENDING");
  }

  function handleArchive() {
    const newStatus = "تەواوکراو و ئەرشیفکراو (Archived)";
    setCurrentStatus(newStatus);
    setStage("ARCHIVED");
    setActionFeedback("دۆسیەکە ئەرشیف کرا.");
    onStatusChange?.(record!.id, newStatus, "APPROVED");
  }

  function handlePrint() {
    window.print();
  }

  const getIcon = () => {
    switch (record.type) {
      case "project":
        return <HardHat className="h-5 w-5 text-[#2E7D32]" />;
      case "document":
        return <FileText className="h-5 w-5 text-[#D97706]" />;
      case "parcel":
        return <MapPin className="h-5 w-5 text-[#017E84]" />;
      case "receipt":
        return <CreditCard className="h-5 w-5 text-[#0284C7]" />;
      default:
        return <Building2 className="h-5 w-5 text-[#714B67]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs select-none overflow-y-auto font-sans">
      {/* Outer Modal Container */}
      <div
        className="w-full max-w-4xl bg-slate-100 dark:bg-slate-950 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col my-auto text-right"
        dir="rtl"
      >
        {/* 1. ODOO FORM CONTROL PANEL BAR */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#017E84] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800">
                  {record.codeOrBarcode}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {record.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {record.municipalityName} • دۆسیەی کارگێڕی فەرمی Odoo 18
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. ODOO WORKFLOW PIPELINE STATUS BAR & ACTIONS */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApprove}
              className="px-3 py-1.5 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>پەسەندکردن (Approve)</span>
            </button>
            <button
              onClick={handleForward}
              className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>ئاڕاستەکردن (Forward)</span>
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1.5 rounded bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-900/50 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>ڕەتکردنەوە (Reject)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>چاپکردنی بەڵگەنامە</span>
            </button>
          </div>

          {/* Workflow Pipeline Stepper: [ڕەشنووس ➔ لەژێر پشکنین ➔ پەسەندکراوی دیوان ➔ تەواوکراو] */}
          <div className="flex items-center text-xs border border-slate-200 dark:border-slate-700 rounded overflow-hidden select-none">
            <div
              onClick={() => setStage("DRAFT")}
              className={cn(
                "px-3 py-1 font-bold flex items-center gap-1 cursor-pointer transition-colors",
                stage === "DRAFT"
                  ? "bg-[#714B67] text-white"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span>ڕەشنووس</span>
              <span className="text-[10px] font-mono opacity-80">(Draft)</span>
            </div>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-300 bg-slate-100 dark:bg-slate-800" />
            <div
              onClick={() => setStage("IN_REVIEW")}
              className={cn(
                "px-3 py-1 font-bold flex items-center gap-1 cursor-pointer transition-colors",
                stage === "IN_REVIEW"
                  ? "bg-[#9A6700] text-white"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span>لەژێر پشکنین</span>
              <span className="text-[10px] font-mono opacity-80">(Review)</span>
            </div>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-300 bg-slate-100 dark:bg-slate-800" />
            <div
              onClick={() => setStage("APPROVED")}
              className={cn(
                "px-3 py-1 font-bold flex items-center gap-1 cursor-pointer transition-colors",
                stage === "APPROVED"
                  ? "bg-[#017E84] text-white"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span>پەسەندکراوی دیوان</span>
              <span className="text-[10px] font-mono opacity-80">(Approved)</span>
            </div>
            <ChevronLeft className="h-3.5 w-3.5 text-slate-300 bg-slate-100 dark:bg-slate-800" />
            <div
              onClick={() => setStage("ARCHIVED")}
              className={cn(
                "px-3 py-1 font-bold flex items-center gap-1 cursor-pointer transition-colors",
                stage === "ARCHIVED"
                  ? "bg-[#2E7D32] text-white"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100"
              )}
            >
              <span>تەواوکراو</span>
              <span className="text-[10px] font-mono opacity-80">(Done)</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert if action taken */}
        {actionFeedback && (
          <div className="mx-6 mt-3 p-2.5 rounded bg-[#E2F7F2] border border-[#B3E7DC] text-[#017E84] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* 3. SCROLLABLE AREA: FORM SHEET & CHATTER */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Centered Odoo Form Sheet (`o_form_sheet`) */}
          <div className="bg-white dark:bg-slate-900 rounded border border-[#DEE2E6] dark:border-slate-800 p-6 shadow-sm space-y-5">
            {/* Sheet Title & Status Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">
                  پوختەی وردبینی دەسەڵاتی کارگێڕی
                </span>
                <h1 className="text-lg font-bold text-slate-950 dark:text-slate-100">
                  {record.title}
                </h1>
              </div>

              <span
                className={cn(
                  "px-3 py-1 rounded text-xs font-bold border",
                  stage === "APPROVED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : stage === "DRAFT"
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : stage === "ARCHIVED"
                    ? "bg-blue-50 text-blue-800 border-blue-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                )}
              >
                {currentStatus}
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {record.primaryMetricLabel && (
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-[#F9F9FB] dark:bg-slate-850">
                  <span className="text-[11px] text-slate-500 block">
                    {record.primaryMetricLabel}
                  </span>
                  <span className="font-mono text-base font-bold text-[#017E84] block mt-0.5">
                    {record.primaryMetricValue}
                  </span>
                </div>
              )}
              {record.secondaryMetricLabel && (
                <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-[#F9F9FB] dark:bg-slate-850">
                  <span className="text-[11px] text-slate-500 block">
                    {record.secondaryMetricLabel}
                  </span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                    {record.secondaryMetricValue}
                  </span>
                </div>
              )}
              <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-[#F9F9FB] dark:bg-slate-850">
                <span className="text-[11px] text-slate-500 block">بەرواری تۆمارکردن</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mt-0.5">
                  {record.dateFormatted || "ئەمڕۆ - کاتژمێر ١٠:٣٠"}
                </span>
              </div>
            </div>

            {/* Detailed Key-Value Grid */}
            {record.details && (
              <div className="rounded border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                <div className="bg-[#F8F9FA] dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  تایبەتمەندییە پەسەندکراوەکان
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(record.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. ODOO CHATTER COMPONENT AT THE BOTTOM OF THE DETAIL SHEET */}
          <OdooChatter recordTitle={record.title} />
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono text-[11px]">
            Odoo 18 Enterprise • Garmian GovTech certified audit log
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            داخستن
          </button>
        </div>
      </div>
    </div>
  );
}
