"use client";

import * as React from "react";
import {
  X,
  Plus,
  Building2,
  HardHat,
  FileText,
  MapPin,
  CreditCard,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { garmianMunicipalities } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

type CreateType = "project" | "parcel" | "document" | "revenue";

interface OdooCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordCreated?: (type: CreateType, data: any) => void;
}

export function OdooCreateModal({
  isOpen,
  onClose,
  onRecordCreated,
}: OdooCreateModalProps) {
  const [activeTab, setActiveTab] = React.useState<CreateType>("project");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Form states
  const [selectedMuni, setSelectedMuni] = React.useState(garmianMunicipalities[1].nameKrd);

  // Project Fields
  const [projectTitle, setProjectTitle] = React.useState("");
  const [projectBudget, setProjectBudget] = React.useState("250000000");
  const [projectContractor, setProjectContractor] = React.useState("کۆمپانیای تەلارساز بۆ بیناکاری");

  // Parcel Fields
  const [parcelNumber, setParcelNumber] = React.useState("142/12");
  const [parcelZone, setParcelZone] = React.useState("کەرتی شێروانە");
  const [parcelArea, setParcelArea] = React.useState("200");
  const [parcelUsage, setParcelUsage] = React.useState("نیشتەجێبوون (Residential)");

  // Document Fields
  const [docSubject, setDocSubject] = React.useState("داواکاری تەرخانکردنی زەوی بۆ پڕۆژەی خزمەتگوزاری");
  const [docUrgency, setDocUrgency] = React.useState("URGENT");

  // Revenue Fields
  const [payerName, setPayerName] = React.useState("کۆمپانیای بازرگانی سیروان");
  const [revenueAmount, setRevenueAmount] = React.useState("3500000");
  const [revenueType, setRevenueType] = React.useState("ڕەسمی مۆڵەتی بیناسازی");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    // Simulate instant persistent creation
    await new Promise((r) => setTimeout(r, 400));

    let createdData: any = {};
    if (activeTab === "project") {
      createdData = {
        id: `proj-${Date.now()}`,
        title: projectTitle || "قیرتاوکردنی شەقامی ناوخۆیی",
        municipalityName: selectedMuni,
        contractor: projectContractor,
        budget: Number(projectBudget) || 250000000,
        budgetFormatted: Number(projectBudget || 250000000).toLocaleString("ckb-IQ") + " د.ع",
        completionRate: 0,
        status: "تەندەرین (دەستپێکی کارگێڕی)",
      };
      setSuccessMessage("پڕۆژەی نوێ بە سەرکەوتوویی لە مۆدیوڵی ئەندازە تۆمارکرا.");
    } else if (activeTab === "parcel") {
      createdData = {
        id: `prc-${Date.now()}`,
        parcelNumber,
        zoneNumber: parcelZone,
        areaSqm: Number(parcelArea) || 200,
        usageType: parcelUsage,
        municipalityName: selectedMuni,
        status: "ALLOCATED",
      };
      setSuccessMessage("پارچە زەوی نوێ بە سەرکەوتوویی لە کاداستری GIS تۆمارکرا.");
    } else if (activeTab === "document") {
      createdData = {
        id: `doc-${Date.now()}`,
        barcode: `GDM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: docSubject,
        senderMunicipality: selectedMuni,
        receiverMunicipality: "بەڕێوەبەرایەتی گشتی شارەوانییەکان",
        urgency: docUrgency,
        createdAtFormatted: "ئێستا",
        status: "نێردراو بۆ واژوو",
        actionRequired: "واژووی بەڕێوەبەری گشتی",
      };
      setSuccessMessage("نوسراوی فەرمی بە بارکۆدی نوێ تۆمارکرا.");
    } else {
      createdData = {
        id: `rev-${Date.now()}`,
        invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        payerName,
        amount: Number(revenueAmount) || 3500000,
        amountFormatted: Number(revenueAmount || 3500000).toLocaleString("ckb-IQ") + " د.ع",
        type: revenueType,
        municipalityName: selectedMuni,
        status: "PAID",
      };
      setSuccessMessage("پسوولەی داهاتی نوێ بە سەرکەوتوویی دەركرا.");
    }

    onRecordCreated?.(activeTab, createdData);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-xl rounded-lg border border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col text-right font-sans"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-[#017E84] text-white flex items-center justify-center shadow-xs">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                دروستکردنی تۆماری فەرمی نوێ (Create Record)
              </h2>
              <p className="text-xs text-slate-500">
                سیستەمی یەکگرتووی شارەوانییەکانی گەرمیان • Odoo Enterprise
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1 gap-1 text-xs">
          <button
            type="button"
            onClick={() => { setActiveTab("project"); setSuccessMessage(null); }}
            className={cn(
              "flex-1 py-2 px-3 rounded flex items-center justify-center gap-1.5 font-bold transition-colors cursor-pointer",
              activeTab === "project"
                ? "bg-white dark:bg-slate-900 text-[#2E7D32] shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50"
            )}
          >
            <HardHat className="h-3.5 w-3.5" />
            <span>پڕۆژەی ئەندازیاری</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("parcel"); setSuccessMessage(null); }}
            className={cn(
              "flex-1 py-2 px-3 rounded flex items-center justify-center gap-1.5 font-bold transition-colors cursor-pointer",
              activeTab === "parcel"
                ? "bg-white dark:bg-slate-900 text-[#017E84] shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50"
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>پارچە زەوی (GIS)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("document"); setSuccessMessage(null); }}
            className={cn(
              "flex-1 py-2 px-3 rounded flex items-center justify-center gap-1.5 font-bold transition-colors cursor-pointer",
              activeTab === "document"
                ? "bg-white dark:bg-slate-900 text-[#D97706] shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>نوسراوی فەرمی (EDMS)</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("revenue"); setSuccessMessage(null); }}
            className={cn(
              "flex-1 py-2 px-3 rounded flex items-center justify-center gap-1.5 font-bold transition-colors cursor-pointer",
              activeTab === "revenue"
                ? "bg-white dark:bg-slate-900 text-[#0284C7] shadow-xs border border-slate-200 dark:border-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:bg-white/50"
            )}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>داهات و پسوولە</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {successMessage && (
            <div className="p-3 rounded bg-[#E2F7F2] border border-[#B3E7DC] text-[#017E84] font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Municipality Jurisdiction selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
              <span className="text-red-500">*</span>
              <span>شارەوانی پەیوەندیدار (١٣ شارەوانی)</span>
            </label>
            <select
              value={selectedMuni}
              onChange={(e) => setSelectedMuni(e.target.value)}
              className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
            >
              {garmianMunicipalities.map((m) => (
                <option key={m.id} value={m.nameKrd}>
                  {m.nameKrd}
                </option>
              ))}
            </select>
          </div>

          {/* Tab 1: Project Fields */}
          {activeTab === "project" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ناوی پڕۆژەی ئەندازیاری
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="وەک: قیرتاوکردنی شەقامەکانی گەڕەکی فەرمانبەران"
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    بودجە (دیناری عێراقی)
                  </label>
                  <input
                    type="number"
                    required
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    کۆمپانیای بەڵێندەر
                  </label>
                  <input
                    type="text"
                    required
                    value={projectContractor}
                    onChange={(e) => setProjectContractor(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Parcel Fields */}
          {activeTab === "parcel" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ژمارەی پارچە
                  </label>
                  <input
                    type="text"
                    required
                    value={parcelNumber}
                    onChange={(e) => setParcelNumber(e.target.value)}
                    placeholder="142/12"
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    کەرتی کاداستر
                  </label>
                  <input
                    type="text"
                    required
                    value={parcelZone}
                    onChange={(e) => setParcelZone(e.target.value)}
                    placeholder="کەرتی شێروانە"
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ڕووبەر (مەتر دووجا)
                  </label>
                  <input
                    type="number"
                    required
                    value={parcelArea}
                    onChange={(e) => setParcelArea(e.target.value)}
                    placeholder="200"
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    بەکارهێنان
                  </label>
                  <select
                    value={parcelUsage}
                    onChange={(e) => setParcelUsage(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  >
                    <option value="نیشتەجێبوون (Residential)">نیشتەجێبوون</option>
                    <option value="بازرگانی (Commercial)">بازرگانی</option>
                    <option value="پیشەسازی (Industrial)">پیشەسازی</option>
                    <option value="خزمەتگوزاری گشتی">خزمەتگوزاری گشتی</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Document Fields */}
          {activeTab === "document" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  بابەتی نوسراو / پەڕاوی فەرمی
                </label>
                <input
                  type="text"
                  required
                  value={docSubject}
                  onChange={(e) => setDocSubject(e.target.value)}
                  placeholder="بابەتی نوسراو بنووسە..."
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ئاستی گرنگی
                </label>
                <select
                  value={docUrgency}
                  onChange={(e) => setDocUrgency(e.target.value)}
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                >
                  <option value="NORMAL">ئاسایی (Normal)</option>
                  <option value="URGENT">بەپەلە (Urgent)</option>
                  <option value="VERY_URGENT">زۆر بەپەلە و کتوپڕ (Very Urgent)</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 4: Revenue Fields */}
          {activeTab === "revenue" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ناوی پێدەر (هاوڵاتی یان کۆمپانیا)
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="ناوی تەواوی کەسی پێدەر..."
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    بڕی پارە (دینار)
                  </label>
                  <input
                    type="number"
                    required
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    جۆری داهات
                  </label>
                  <select
                    value={revenueType}
                    onChange={(e) => setRevenueType(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                  >
                    <option value="ڕەسمی مۆڵەتی بیناسازی">ڕەسمی مۆڵەتی بیناسازی</option>
                    <option value="کرێی موڵک و دوکانی شارەوانی">کرێی موڵک و دوکان</option>
                    <option value="ڕەسمی پاکوخاوێنی و خۆڵ">ڕەسمی پاکوخاوێنی</option>
                    <option value="سەرپێچی و پێبژاردن">سەرپێچی و پێبژاردن</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>لە پرۆسەی تۆمارکردندایە...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>تۆمارکردن لە سیستەم</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

