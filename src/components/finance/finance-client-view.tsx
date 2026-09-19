"use client";

import * as React from "react";
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  Barcode,
  Building,
  User,
  CheckCircle2,
  Clock,
  Coins,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { InvoiceDTO, getInvoicesAction } from "@/actions/finance";
import { CreateInvoiceModal } from "./create-invoice-modal";
import { OfficialReceipt } from "./official-receipt";

interface MunicipalityOption {
  id: string;
  nameKrd: string;
  isHeadquarter: boolean;
}

interface FinanceClientViewProps {
  initialInvoices: InvoiceDTO[];
  totalCollectedFormatted: string;
  paidCount: number;
  pendingCount: number;
  municipalities: MunicipalityOption[];
  userMunicipalityId?: string;
}

export function FinanceClientView({
  initialInvoices,
  totalCollectedFormatted,
  paidCount,
  pendingCount,
  municipalities,
  userMunicipalityId,
}: FinanceClientViewProps) {
  const [invoices, setInvoices] = React.useState<InvoiceDTO[]>(initialInvoices);
  const [totalFormatted, setTotalFormatted] = React.useState(totalCollectedFormatted);
  const [paid, setPaid] = React.useState(paidCount);
  const [pending, setPending] = React.useState(pendingCount);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceDTO | null>(null);

  const handleRefresh = async (justCreatedInvoiceNumber?: string) => {
    try {
      const res = await getInvoicesAction();
      setInvoices(res.invoices);
      setTotalFormatted(res.totalCollectedFormatted);
      setPaid(res.paidCount);
      setPending(res.pendingCount);

      if (justCreatedInvoiceNumber) {
        const found = res.invoices.find(
          (inv) => inv.invoiceNumber === justCreatedInvoiceNumber
        );
        if (found) {
          setSelectedInvoice(found);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.payerName.toLowerCase().includes(q) ||
        inv.municipalityNameKrd.toLowerCase().includes(q) ||
        inv.type.toLowerCase().includes(q)
      );
    });
  }, [invoices, searchQuery]);

  return (
    <div className="space-y-6 text-right">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-foreground">
              بەڕێوەبردنی دارایی، داهات و پسوولەی فەرمی
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              وەرگرتنی داهاتی شارەوانی، دەرکردنی پسوولەی فەرمی و چاودێری پارەدان
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>وەرگرتنی داهات و دەرکردنی پسوولە</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground block">
            کۆی داهاتی وەرگیراو
          </span>
          <div className="mt-2 text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalFormatted}
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            رسومات و کرێی موڵکەکان
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground block">
            پسوولە دەرچووەکانی ئەم مانگە
          </span>
          <div className="mt-2 text-xl md:text-2xl font-black text-foreground">
            {paid} پسوولە
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">
            ١٠٠% پارەدانی چەسپاو
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs font-bold text-muted-foreground block">
            باری ژمێریاری و وردبینی
          </span>
          <div className="mt-2 text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <span>هاوکاتکراو</span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            لەگەڵ گەنجینەی گەرمیان
          </span>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گەڕان بەپێی ژمارەی پسوولە، ناوی باجدەر، شارەوانی..."
            className="w-full rounded-xl border border-border bg-background py-2 pr-9 pl-4 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
          />
        </div>

        <span className="text-xs font-bold text-muted-foreground self-center">
          کۆی تۆمارەکان: {filteredInvoices.length} پسوولە
        </span>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3.5 px-4 font-bold">ژمارەی زنجیرەی پسوولە</th>
                <th className="py-3.5 px-4 font-bold">ناوی باجدەر / هاوڵاتی</th>
                <th className="py-3.5 px-4 font-bold">شارەوانی</th>
                <th className="py-3.5 px-4 font-bold">جۆری داهات</th>
                <th className="py-3.5 px-4 font-bold">بڕی وەرگیراو</th>
                <th className="py-3.5 px-4 font-bold">بەروار</th>
                <th className="py-3.5 px-4 text-left font-bold">پسوولەی فەرمی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    هیچ پسوولەیەک نەدۆزرایەوە بەپێی ئەم گەڕانە.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-accent/40 transition-colors group"
                  >
                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <Barcode className="h-4 w-4 text-muted-foreground" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                    </td>

                    {/* Payer Name */}
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {inv.payerName}
                    </td>

                    {/* Municipality */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      <span className="rounded-md bg-accent/60 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {inv.municipalityNameKrd}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 text-foreground/90 max-w-xs truncate">
                      {inv.type}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-black text-foreground">
                      {inv.amountFormatted}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                      {new Date(inv.createdAt).toLocaleDateString("ku", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Print Button */}
                    <td className="py-3.5 px-4 text-left">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>چاپکردنی پسوولە</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        municipalities={municipalities}
        defaultMunicipalityId={userMunicipalityId}
        onSuccess={(invoiceNumber) => {
          handleRefresh(invoiceNumber);
        }}
      />

      <OfficialReceipt
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}

