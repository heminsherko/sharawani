"use client";

import * as React from "react";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Send,
  QrCode,
  ArrowLeft,
  CheckSquare,
  Square,
  Printer,
  ExternalLink,
} from "lucide-react";
import { PendingDocumentItem } from "@/actions/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PendingDocumentsQueueProps {
  queue: PendingDocumentItem[];
  onInspect?: (doc: PendingDocumentItem) => void;
}

export function PendingDocumentsQueue({
  queue,
  onInspect,
}: PendingDocumentsQueueProps) {
  const [docStatuses, setDocStatuses] = React.useState<
    Record<string, { label: string; type: "APPROVED" | "REJECTED" | "FORWARDED" }>
  >({});
  const [selectedDocs, setSelectedDocs] = React.useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = React.useState(false);

  function handleAction(
    e: React.MouseEvent,
    id: string,
    action: "APPROVED" | "REJECTED" | "FORWARDED",
    label: string
  ) {
    e.stopPropagation();
    setDocStatuses((prev) => ({
      ...prev,
      [id]: { label, type: action },
    }));
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectedDocs({});
      setSelectAll(false);
    } else {
      const all: Record<string, boolean> = {};
      queue.forEach((d) => (all[d.id] = true));
      setSelectedDocs(all);
      setSelectAll(true);
    }
  }

  function toggleRow(id: string) {
    setSelectedDocs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-right overflow-hidden">
      {/* Odoo Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#017E84] text-white shadow-xs">
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>کارنامەی نوسراوە لە چاوەڕوانی واژوو (EDMS Queue)</span>
              <span className="font-mono text-[10px] text-[#714B67] font-bold">
                (Odoo Workflow)
              </span>
            </h2>
          </div>
        </div>

        <Link
          href="/dashboard/documents"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#017E84] hover:underline"
        >
          <span>تەواوی نوسراوەکان (EDMS)</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Odoo Enterprise List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#F1F2F6] dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 select-none">
              <th className="py-2.5 px-3 text-center w-8">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {selectAll ? (
                    <CheckSquare className="h-4 w-4 text-[#017E84]" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3 text-right">بارکۆدی فەرمی</th>
              <th className="py-2.5 px-3 text-right">بابەتی مامەڵە و نوسراو</th>
              <th className="py-2.5 px-3 text-right">لایەنی نێرەر</th>
              <th className="py-2.5 px-3 text-center">ئاستی گرنگی</th>
              <th className="py-2.5 px-3 text-center">کات / بەروار</th>
              <th className="py-2.5 px-3 text-center">کردار و بڕیار</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {queue.map((doc) => {
              const statusOverride = docStatuses[doc.id];
              const isSelected = !!selectedDocs[doc.id];

              return (
                <tr
                  key={doc.id}
                  onClick={() => onInspect?.(doc)}
                  className={cn(
                    "h-10 cursor-pointer transition-colors even:bg-[#FAFAFB] dark:even:bg-slate-850/40",
                    isSelected
                      ? "bg-[#E2F7F2]/50 hover:bg-[#E2F7F2]"
                      : "hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
                  )}
                >
                  {/* Checkbox */}
                  <td
                    className="py-1.5 px-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRow(doc.id);
                    }}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-4 w-4 text-[#017E84]" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </td>

                  {/* Barcode */}
                  <td className="py-1.5 px-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      <QrCode className="h-3 w-3 text-slate-500" />
                      <span>{doc.barcode}</span>
                    </span>
                  </td>

                  {/* Subject */}
                  <td className="py-1.5 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100 max-w-md truncate text-sm">
                      {doc.subject}
                    </div>
                  </td>

                  {/* Sender Municipality */}
                  <td className="py-1.5 px-3">
                    <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                      {doc.senderMunicipality}
                    </span>
                  </td>

                  {/* Urgency Pill */}
                  <td className="py-1.5 px-3 text-center">
                    {doc.urgency === "VERY_URGENT" && (
                      <span className="odoo-badge-rejected font-bold text-xs">
                        زۆر بەپەلە
                      </span>
                    )}
                    {doc.urgency === "URGENT" && (
                      <span className="odoo-badge-pending font-bold text-xs">
                        بەپەلە
                      </span>
                    )}
                    {doc.urgency === "NORMAL" && (
                      <span className="odoo-badge-approved text-xs">
                        ئاسایی
                      </span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-1.5 px-3 text-center">
                    <span className="text-xs font-mono text-slate-500">
                      {doc.createdAtFormatted}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td
                    className="py-1.5 px-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {statusOverride ? (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded font-bold inline-flex items-center gap-1",
                          statusOverride.type === "APPROVED" && "odoo-badge-approved",
                          statusOverride.type === "REJECTED" && "odoo-badge-rejected",
                          statusOverride.type === "FORWARDED" && "odoo-badge-pending"
                        )}
                      >
                        {statusOverride.type === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {statusOverride.type === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {statusOverride.type === "FORWARDED" && <Send className="h-3 w-3" />}
                        <span>{statusOverride.label}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          type="button"
                          onClick={(e) => handleAction(e, doc.id, "APPROVED", "پەسەندکرا")}
                          title="پەسەندکردن و واژوو"
                          className="px-2 py-1 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>پەسەندکردن</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAction(e, doc.id, "FORWARDED", "ئاڕاستەکرا")}
                          title="ئاڕاستەکردن بۆ وردبینی"
                          className="px-1.5 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAction(e, doc.id, "REJECTED", "ڕەتکرایەوە")}
                          title="ڕەتکردنەوە"
                          className="px-1.5 py-1 rounded border border-red-200 dark:border-red-900/50 hover:bg-red-50 text-red-700 dark:text-red-400 text-xs font-semibold cursor-pointer"
                        >
                          <XCircle className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
