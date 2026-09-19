"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  Database,
  Loader2,
  ShieldCheck,
  HardHat,
  MapPin,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { garmianMunicipalities } from "@/components/layout/topbar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const departments = [
  { id: "GIS", name: "بەشی زەویوزار، نەخشە و GIS" },
  { id: "ENG", name: "بەشی ئەندازە و پڕۆژەکان" },
  { id: "ADM", name: "بەشی کارگێڕی و ئەرشیف (EDMS)" },
  { id: "FIN", name: "بەشی دارایی و ژمێریاری" },
  { id: "VIO", name: "بەشی سەرپێچی و زیادەڕۆیی" },
  { id: "LAW", name: "بەشی یاسا و گرێبەستەکان" },
];

const demoRolesList = [
  {
    key: "DG",
    title: "بەڕێوەبەری گشتی - گەرمیان",
    scope: "دیوانی گشتی • دەسەڵاتی سەرتاسەری و پەسەندکردنی کۆتایی",
    badge: "سەرتاسەری HQ",
    icon: ShieldCheck,
    badgeClass: "odoo-badge-approved",
  },
  {
    key: "MAYOR_KALAR",
    title: "سەرۆکی شارەوانی کەلار",
    scope: "شارەوانی پلە یەک • پڕۆژەکان، زەوی و کارگێڕی کەلار",
    badge: "کەلار TIER 1",
    icon: Building2,
    badgeClass: "odoo-badge-pending",
  },
  {
    key: "MAYOR_KIFRI",
    title: "سەرۆکی شارەوانی کفری",
    scope: "شارەوانی پلە یەک • سەرپەرشتی کاروباری کفری",
    badge: "کفری TIER 1",
    icon: Building2,
    badgeClass: "odoo-badge-pending",
  },
  {
    key: "MAYOR_RIZGARI",
    title: "سەرۆکی شارەوانی ڕزگاری",
    scope: "شارەوانی پلە دوو • پڕۆژە و خزمەتگوزاری ڕزگاری",
    badge: "ڕزگاری TIER 2",
    icon: Building2,
    badgeClass: "odoo-badge-pending",
  },
  {
    key: "ENGINEER",
    title: "ئەندازیاری سەرپەرشتیار - بەشی ئەندازە",
    scope: "چاودێری پڕۆژە، خشتەی بڕەکان (BOQ) و ڕێژەی تەواوبوون",
    badge: "ئەندازە ENG",
    icon: HardHat,
    badgeClass: "odoo-badge-approved",
  },
  {
    key: "LAND_OFFICER",
    title: "لێپرسراوی زەویوزار و تاپۆ",
    scope: "تۆمارکردنی کاداستری زەوی، سنووری GIS و تەرخانکردن",
    badge: "کاداستر GIS",
    icon: MapPin,
    badgeClass: "odoo-badge-approved",
  },
  {
    key: "FINANCE_OFFICER",
    title: "ژمێریار و داهات - بەشی دارایی",
    scope: "دەرکردنی پسوولەی فەرمی داهات، کرێ و ڕسومات",
    badge: "دارایی FIN",
    icon: CreditCard,
    badgeClass: "odoo-badge-approved",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedMuni, setSelectedMuni] = React.useState(
    garmianMunicipalities[0].id
  );
  const [selectedDept, setSelectedDept] = React.useState(departments[0].id);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activeDemoRole, setActiveDemoRole] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          municipalityId: selectedMuni,
          departmentId: selectedDept,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setError(data.error || "هەڵەیەک ڕوویدا لە کاتی چوونەژوورەوە");
        setLoading(false);
        return;
      }

      window.location.href = data.redirect || "/dashboard";
    } catch (err: any) {
      setError(err?.message || "هەڵەی تۆڕ یان سێرڤەر ڕوویدا");
      setLoading(false);
    }
  }

  async function handleQuickDemoLogin(roleKey: string) {
    setLoading(true);
    setActiveDemoRole(roleKey);
    setError(null);

    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setError(data.error || "هەڵە لە چوونەژوورەوەی خێرا");
        setLoading(false);
        setActiveDemoRole(null);
        return;
      }

      window.location.href = data.redirect || "/dashboard";
    } catch (err: any) {
      setError(err?.message || "هەڵە لە پەیوەندی لەگەڵ سێرڤەر");
      setLoading(false);
      setActiveDemoRole(null);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#F9F9FB] dark:bg-slate-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans select-none"
    >
      {/* Top Navbar Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-[#714B67] text-white flex items-center justify-center shadow-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
              بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
            </span>
            <span className="block text-[10px] text-slate-400 font-mono">
              Odoo Enterprise v18 • Gov ERP
            </span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Odoo Enterprise Login Card */}
      <main className="w-full max-w-2xl mx-auto my-auto py-2">
        <div className="rounded-lg border border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm text-right space-y-6">
          {/* Odoo Enterprise Branding Banner */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="inline-flex h-12 w-12 rounded-xl bg-[#714B67] text-white items-center justify-center shadow-sm mb-1">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              چوونەژوورەوە بۆ سیستەمی یەکگرتووی شارەوانییەکان
            </h1>
            <p className="text-xs text-slate-500">
              ئیدارەی سەربەخۆی گەرمیان • بەڕێوەبەرایەتی گشتی و ١٣ شارەوانی
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="rounded border border-red-200 bg-[#FDE8E8] p-3 text-xs font-bold text-[#9B1C1C] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Municipality Jurisdiction */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
                  <span className="text-red-500">*</span>
                  <span>شارەوانی / دەسەڵاتی کارگێڕی (Branch)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedMuni}
                    onChange={(e) => setSelectedMuni(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right appearance-none"
                  >
                    {garmianMunicipalities.map((muni) => (
                      <option key={muni.id} value={muni.id}>
                        {muni.nameKrd} {muni.isHeadquarter ? "— (دیوانی گشتی)" : `— (${muni.tier})`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
                  <span className="text-red-500">*</span>
                  <span>بەشی کارگێڕی (Department)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right appearance-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* National ID / Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
                  <span className="text-red-500">*</span>
                  <span>ناسنامە یان مۆبایل (User Login)</span>
                </label>
                <input
                  name="identifier"
                  type="text"
                  placeholder="07701500001"
                  defaultValue="07701500001"
                  required
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 px-3 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
                  <span className="text-red-500">*</span>
                  <span>وشەی نهێنی (Password)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  defaultValue="Garmian@2026"
                  required
                  className="w-full h-9 rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#017E84] text-right"
                />
              </div>
            </div>

            {/* Submit Button (Odoo Teal CTA) */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded bg-[#017E84] hover:bg-[#00676C] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {loading && !activeDemoRole ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>لە پرۆسەی چوونەژوورەوەدایە...</span>
                  </div>
                ) : (
                  <>
                    <span>چوونەژوورەوە (Log in)</span>
                    <ArrowRight className="h-4 w-4 rotate-180" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Odoo Quick Demo Database Users Switcher (7 Distinct Personas) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-[#714B67]" />
                <span>تاقیکردنەوەی دەستبەجێ بە ٧ ڕۆڵی فەرمی (Demo Personas):</span>
              </span>
              <span className="font-mono text-xs text-[#017E84] font-bold">
                1-Click Direct Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoRolesList.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeDemoRole === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleQuickDemoLogin(item.key)}
                    disabled={loading}
                    className={`rounded border border-[#DEE2E6] dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 hover:border-[#017E84] p-2.5 text-right transition-all cursor-pointer group ${
                      isActive ? "ring-2 ring-[#017E84] bg-teal-50/40 dark:bg-teal-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <IconComponent className="h-3.5 w-3.5 text-[#714B67] dark:text-purple-300 group-hover:text-[#017E84] transition-colors shrink-0" />
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                      </div>
                      {isActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#017E84]" />
                      ) : (
                        <span className={`${item.badgeClass} text-[10px] py-0 px-1.5 font-mono`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                      {item.scope}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-4 text-center text-xs text-slate-400">
        سیستەمی فەرمی Odoo Enterprise v18 • بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
      </footer>
    </div>
  );
}
