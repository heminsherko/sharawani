"use client";

import * as React from "react";
import {
  X,
  CreditCard,
  Building,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  IdCard,
} from "lucide-react";
import { createInvoiceAction } from "@/actions/finance";

export const REVENUE_TYPES = [
  { id: "BUILDING_PERMIT", label: "بڕینی مۆڵەتی بینا (Building Permit)" },
  { id: "SHOP_RENT", label: "کرێی دووکان و موڵکەکان (Property & Shop Rent)" },
  { id: "VIOLATION_FINE", label: "سزای سەرپێچی و زیادەڕۆیی (Violation Fine)" },
  { id: "WASTE_TAX", label: "باجی پاشماوە و خزمەتگوزاری (Waste & Service Tax)" },
  { id: "ADVERTISEMENT_FEE", label: "ڕەسمی تابلۆ و ریکلام (Advertisement Fee)" },
];

interface MunicipalityOption {
  id: string;
  nameKrd: string;
  isHeadquarter: boolean;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipalities: MunicipalityOption[];
  defaultMunicipalityId?: string;
  onSuccess: (invoiceNumber: string) => void;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  municipalities,
  defaultMunicipalityId,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [municipalityId, setMunicipalityId] = React.useState(
    defaultMunicipalityId || (municipalities[0]?.id ?? "")
  );
  const [payerName, setPayerName] = React.useState("");
  const [payerNationalId, setPayerNationalId] = React.useState("198900142851");
  const [amount, setAmount] = React.useState("2500000");
  const [type, setType] = React.useState(REVENUE_TYPES[0].label);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (defaultMunicipalityId) {
      setMunicipalityId(defaultMunicipalityId);
    }
  }, [defaultMunicipalityId]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!payerName.trim()) {
      setError("تکایە ناوی باجدەر یان هاوڵاتی بنووسە.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("تکایە بڕی پارەی دروست بە دینار دیاریبکە.");
      return;
    }

    setLoading(true);

    const res = await createInvoiceAction({
      municipalityId,
      payerName: payerName.trim(),
      payerNationalId: payerNationalId.trim(),
      amount: numAmount,
      type,
    });

    setLoading(false);

    if (res.success && res.invoiceNumber) {
      onSuccess(res.invoiceNumber);
      onClose();
    } else {
      setError(res.error || "هەڵەیەک ڕوویدا لە دەرکردنی پسوولە.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                وەرگرتنی داهات و دەرکردنی پسوولە
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                تۆمارکردنی داهاتی فەرمی بەشی دارایی و پسوولەی وەرگرتن
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
          {/* Municipality Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              شارەوانی دەسەڵاتدار
            </label>
            <select
              value={municipalityId}
              onChange={(e) => setMunicipalityId(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right cursor-pointer"
            >
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameKrd} {m.isHeadquarter ? "★ (مەڵبەندی گشتی)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Payer Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              ناوی چواری باجدەر / هاوڵاتی (Payer Name)
            </label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              placeholder="وەک: کاروان فەتاح قادر"
              required
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
            />
          </div>

          {/* National ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              ناسنامەی نیشتمانی / باری شارستانی (National ID)
            </label>
            <input
              type="text"
              value={payerNationalId}
              onChange={(e) => setPayerNationalId(e.target.value)}
              placeholder="وەک: 198900142851"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right"
            />
          </div>

          {/* Revenue Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              جۆری داهات و خزمەتگوزاری (Revenue Type)
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-emerald-500 focus:outline-none text-right cursor-pointer"
            >
              {REVENUE_TYPES.map((t) => (
                <option key={t.id} value={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount (IQD) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              بڕی پارەی وەرگیراو بە دیناری عێراقی (IQD)
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500000"
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono font-bold text-foreground focus:border-emerald-500 focus:outline-none text-right pl-14"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                د.ع
              </span>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold hover:bg-accent"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <span>تۆماردەکرێت...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>دەرکردنی پسوولە</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
