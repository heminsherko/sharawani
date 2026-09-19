"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Search,
  Barcode,
  Send,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  Building,
  ArrowRight,
} from "lucide-react";
import { DocumentDTO, getDocumentsAction } from "@/actions/documents";
import { CreateDocumentModal } from "./create-document-modal";
import { DocumentDetailModal } from "./document-detail-modal";

interface MunicipalityOption {
  id: string;
  nameKrd: string;
  isHeadquarter: boolean;
}

interface EDMSClientViewProps {
  initialDocuments: DocumentDTO[];
  municipalities: MunicipalityOption[];
  userMunicipalityId?: string;
}

export function EDMSClientView({
  initialDocuments,
  municipalities,
}: EDMSClientViewProps) {
  const [documents, setDocuments] = React.useState<DocumentDTO[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("ALL");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<DocumentDTO | null>(null);

  const handleRefresh = async () => {
    try {
      const data = await getDocumentsAction();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredDocs = React.useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        doc.barcode.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.senderMunicipalityName.toLowerCase().includes(q) ||
        doc.destinationMunicipalityName?.toLowerCase().includes(q);

      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "IN_TRANSIT" &&
          (doc.status === "DISPATCHED" ||
            doc.status === "IN_TRANSIT" ||
            doc.status === "RECEIVED")) ||
        (filterStatus === "ARCHIVED" && doc.status === "ARCHIVED") ||
        (filterStatus === "REJECTED" && doc.status === "REJECTED");

      return matchSearch && matchStatus;
    });
  }, [documents, searchQuery, filterStatus]);

  const getStatusPill = (status: string) => {
    switch (status) {
      case "ARCHIVED":
        return {
          label: "تەواوکراو / ئەرشیف",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "REJECTED":
        return {
          label: "ڕەتکرایەوە",
          className: "bg-red-500/10 text-red-600 border-red-500/30",
          icon: XCircle,
        };
      case "RECEIVED":
        return {
          label: "گەیشتووە / لەژێر کاردایە",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/30",
          icon: Inbox,
        };
      default:
        return {
          label: "لە گەڕاندایە",
          className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-5 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-foreground">
              سیستەمی پەڕاو و نوسراوە ئەلیکترۆنییەکان (EDMS)
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ئاڵوگۆڕی نوسراوی فەرمی لەنێوان ١٣ شارەوانی گەرمیان بە بارکۆدی پارێزراو
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-500 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>دەرکردنی نوسراوی نوێ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەپێی بارکۆد (GDM-2026-XXXX)، بابەت، یان شارەوانی..."
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-3 text-xs text-foreground focus:border-amber-500 focus:outline-none text-right"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === "ALL"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            هەموو نوسراوەکان ({documents.length})
          </button>
          <button
            onClick={() => setFilterStatus("IN_TRANSIT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === "IN_TRANSIT"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            لە گەڕاندان
          </button>
          <button
            onClick={() => setFilterStatus("ARCHIVED")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === "ARCHIVED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            ڕەزامەندیدراو / ئەرشیف
          </button>
          <button
            onClick={() => setFilterStatus("REJECTED")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filterStatus === "REJECTED"
                ? "bg-red-600 text-white shadow-sm"
                : "text-red-700 dark:text-red-400 hover:bg-red-500/10"
            }`}
          >
            ڕەتکراوەتەوە
          </button>
        </div>
      </div>

      {/* Documents List / Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4 font-bold">بارکۆدی بەدواداچوون</th>
                <th className="py-3 px-4 font-bold">بابەتی نوسراو</th>
                <th className="py-3 px-4 font-bold">شارەوانی سەرچاوە ➜ مەبەست</th>
                <th className="py-3 px-4 font-bold">ئاستی گرنگی</th>
                <th className="py-3 px-4 font-bold">باری نوسراو</th>
                <th className="py-3 px-4 font-bold">بەروار</th>
                <th className="py-3 px-4 text-left font-bold">کردار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    هیچ نوسراوێک نەدۆزرایەوە بەپێی ئەم فلتەرە.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const statusInfo = getStatusPill(doc.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-accent/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      {/* Barcode */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        <div className="flex items-center gap-1.5">
                          <Barcode className="h-4 w-4 text-muted-foreground" />
                          <span>{doc.barcode}</span>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 font-bold text-foreground max-w-xs truncate">
                        {doc.subject}
                      </td>

                      {/* Route municipalities */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {doc.senderMunicipalityName}
                        </span>
                        <span className="mx-1.5 text-xs text-muted-foreground">➜</span>
                        <span className="font-semibold text-foreground">
                          {doc.destinationMunicipalityName}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            doc.urgency === "VERY_URGENT"
                              ? "bg-red-500/10 text-red-600 border-red-500/20"
                              : doc.urgency === "URGENT"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}
                        >
                          {doc.urgency === "VERY_URGENT"
                            ? "زۆر بەپەلە"
                            : doc.urgency === "URGENT"
                            ? "بەپەلە"
                            : "ئاسایی"}
                        </span>
                      </td>

                      {/* Status pill */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusInfo.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusInfo.label}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(doc.createdAt).toLocaleDateString("ku", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-left">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                          className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:bg-accent transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>بینین</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateDocumentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        municipalities={municipalities}
        onSuccess={(barcode) => {
          handleRefresh();
        }}
      />

      <DocumentDetailModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        municipalities={municipalities}
        onActionComplete={handleRefresh}
      />
    </div>
  );
}

