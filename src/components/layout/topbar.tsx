"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Grid,
  Building2,
  ChevronDown,
  Check,
  User,
  LogOut,
  Bell,
  LayoutDashboard,
  MapPin,
  HardHat,
  FileText,
  CreditCard,
  AlertTriangle,
  Settings,
  ShieldCheck,
  X,
  UserCheck,
  Loader2,
  Layers,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

export interface MunicipalityOption {
  id: string;
  nameKrd: string;
  nameEng: string;
  tier: string;
  isHeadquarter: boolean;
}

export const garmianMunicipalities: MunicipalityOption[] = [
  {
    id: "garmian-hq",
    nameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان (HQ - ناوەند)",
    nameEng: "Garmian Municipalities Directorate General",
    tier: "HEADQUARTER",
    isHeadquarter: true,
  },
  {
    id: "kalar",
    nameKrd: "سەرۆکایەتی شارەوانی کەلار (پلە یەک)",
    nameEng: "Kalar Municipality",
    tier: "TIER_1",
    isHeadquarter: false,
  },
  {
    id: "kifri",
    nameKrd: "سەرۆکایەتی شارەوانی کفری",
    nameEng: "Kifri Municipality",
    tier: "TIER_1",
    isHeadquarter: false,
  },
  {
    id: "rizgari",
    nameKrd: "شارەوانی ڕزگاری (سمود)",
    nameEng: "Rizgari Municipality",
    tier: "TIER_2",
    isHeadquarter: false,
  },
  {
    id: "pebaz",
    nameKrd: "شارەوانی پێباز (باوەنوور)",
    nameEng: "Pebaz (Bawanur) Municipality",
    tier: "TIER_2",
    isHeadquarter: false,
  },
  {
    id: "sarqala",
    nameKrd: "شارەوانی سەرقەڵا",
    nameEng: "Sarqala Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "nawjul",
    nameKrd: "شارەوانی نەوجول",
    nameEng: "Nawjul Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "sheikh-tawil",
    nameKrd: "شارەوانی شێخ تەویل",
    nameEng: "Sheikh Tawil Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "koks",
    nameKrd: "شارەوانی کۆکس",
    nameEng: "Koks Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "awaspi",
    nameKrd: "شارەوانی ئاوەسپی",
    nameEng: "Awaspi Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "maydan",
    nameKrd: "شارەوانی مەیدان",
    nameEng: "Maydan Municipality",
    tier: "TIER_2",
    isHeadquarter: false,
  },
  {
    id: "qoratu",
    nameKrd: "شارەوانی قۆرەتوو",
    nameEng: "Qoratu Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
  {
    id: "bamo",
    nameKrd: "شارەوانی بەمۆ",
    nameEng: "Bamo Municipality",
    tier: "TIER_3",
    isHeadquarter: false,
  },
];

// Odoo Enterprise App Matrix Items matching gold standard specification
const odooApps = [
  {
    name: "داشبۆردی سەرکردایەتی",
    href: "/dashboard",
    icon: LayoutDashboard,
    bg: "bg-[#714B67] hover:bg-[#5D3D55]",
  },
  {
    name: "نەخشەسازی و زەویوزار GIS",
    href: "/dashboard/parcels",
    icon: MapPin,
    bg: "bg-[#017E84] hover:bg-[#00676C]",
  },
  {
    name: "ئەندازە و پڕۆژەکان",
    href: "/projects",
    icon: HardHat,
    bg: "bg-[#2E7D32] hover:bg-[#1B5E20]",
  },
  {
    name: "نوسراوەکان EDMS",
    href: "/dashboard/documents",
    icon: FileText,
    bg: "bg-[#D97706] hover:bg-[#B45309]",
  },
  {
    name: "دارایی و داهات",
    href: "/dashboard/finance",
    icon: CreditCard,
    bg: "bg-[#0284C7] hover:bg-[#0369A1]",
  },
  {
    name: "لادانی زیادەڕۆیی",
    href: "/dashboard/violations",
    icon: AlertTriangle,
    bg: "bg-[#E11D48] hover:bg-[#BE123C]",
  },
  {
    name: "بەڕێوەبردنی میلاکات",
    href: "/dashboard#municipalities",
    icon: Building2,
    bg: "bg-[#6366F1] hover:bg-[#4F46E5]",
  },
  {
    name: "تۆماری وردبینی",
    href: "/settings",
    icon: ShieldCheck,
    bg: "bg-[#475569] hover:bg-[#334155]",
  },
];

const personaOptions = [
  {
    key: "DG",
    title: "بەڕێوەبەری گشتی - گەرمیان",
    role: "DIRECTOR_GENERAL",
    muni: "بەڕێوەبەرایەتی گشتی (HQ)",
    badge: "سەرتاسەری HQ",
  },
  {
    key: "MAYOR_KALAR",
    title: "سەرۆکی شارەوانی کەلار",
    role: "MAYOR",
    muni: "شارەوانی کەلار",
    badge: "کەلار TIER 1",
  },
  {
    key: "MAYOR_KIFRI",
    title: "سەرۆکی شارەوانی کفری",
    role: "MAYOR",
    muni: "شارەوانی کفری",
    badge: "کفری TIER 1",
  },
  {
    key: "MAYOR_RIZGARI",
    title: "سەرۆکی شارەوانی ڕزگاری",
    role: "MAYOR",
    muni: "شارەوانی ڕزگاری (سمود)",
    badge: "ڕزگاری TIER 2",
  },
  {
    key: "ENGINEER",
    title: "ئەندازیاری سەرپەرشتیار",
    role: "ENGINEER",
    muni: "بەشی ئەندازە و پڕۆژەکان",
    badge: "ئەندازە ENG",
  },
  {
    key: "LAND_OFFICER",
    title: "لێپرسراوی زەویوزار و تاپۆ",
    role: "LAND_OFFICER",
    muni: "بەشی کاداستر و GIS",
    badge: "کاداستر GIS",
  },
  {
    key: "FINANCE_OFFICER",
    title: "ژمێریار و داهات",
    role: "FINANCE_OFFICER",
    muni: "بەشی دارایی و ژمێریاری",
    badge: "دارایی FIN",
  },
];

interface TopbarProps {
  onMobileMenuToggle?: () => void;
  currentUser?: {
    fullName: string;
    phone?: string;
    role: string;
    municipalityNameKrd: string;
    isHeadquarter: boolean;
  };
}

export function Topbar({ currentUser }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedMuni, setSelectedMuni] = React.useState<MunicipalityOption>(
    garmianMunicipalities[0]
  );
  const [appSwitcherOpen, setAppSwitcherOpen] = React.useState(false);
  const [muniDropdownOpen, setMuniDropdownOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [personaSwitcherOpen, setPersonaSwitcherOpen] = React.useState(false);
  const [switchingRole, setSwitchingRole] = React.useState<string | null>(null);

  // Sync selected municipality from URL query param or localStorage on mount
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlMuni = params.get("muni");
      if (urlMuni) {
        const found = garmianMunicipalities.find(
          (m) => m.id.toLowerCase() === urlMuni.toLowerCase()
        );
        if (found) {
          setSelectedMuni(found);
          return;
        }
      }
      const saved = localStorage.getItem("garmian_selected_muni");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) {
          const found = garmianMunicipalities.find((m) => m.id === parsed.id);
          if (found) setSelectedMuni(found);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const activeMuniName = selectedMuni
    ? selectedMuni.nameKrd
    : currentUser
    ? currentUser.municipalityNameKrd
    : garmianMunicipalities[0].nameKrd;

  const isHq = selectedMuni ? selectedMuni.isHeadquarter : (currentUser?.isHeadquarter ?? true);

  // Authentic Odoo Breadcrumb Hierarchy
  function getCurrentModuleName(): string {
    if (pathname.startsWith("/dashboard/parcels")) return "زەویوزار و کاداستری GIS / نەخشەی کاداستر";
    if (pathname.startsWith("/dashboard/documents")) return "کارگێڕی و ئەرشیف EDMS / نوسراوە فەرمییەکان";
    if (pathname.startsWith("/dashboard/finance")) return "بەشی دارایی / داهات و پسوولەی شارەوانی";
    if (pathname.startsWith("/dashboard/violations")) return "بەشی زیادەڕۆیی / لادانی سەرپێچییەکان";
    if (pathname.startsWith("/projects")) return "بەشی ئەندازە / پڕۆژە ستراتیژییەکان";
    if (pathname.startsWith("/settings")) return "تۆماری وردبینی و چاودێری یاسایی";
    return "داشبۆردی سەرکردایەتی / ماتریسی شارەوانییەکان";
  }

  async function handleSwitchPersona(roleKey: string) {
    setSwitchingRole(roleKey);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        setSwitchingRole(null);
      }
    } catch {
      setSwitchingRole(null);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 flex h-12 w-full items-center justify-between bg-[#714B67] text-white px-3 sm:px-4 shadow-sm select-none border-b border-[#5D3D55]">
      {/* RIGHT SIDE (RTL): Odoo App Switcher (Waffle) & Module Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Odoo App Switcher (Waffle Menu) */}
        <button
          onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
          title="ئەپڵیکەیشنەکانی سیستەم (Odoo App Switcher)"
          aria-label="ئەپڵیکەیشنەکان"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded hover:bg-white/15 transition-colors cursor-pointer",
            appSwitcherOpen && "bg-white/20"
          )}
        >
          <Grid className="h-4 w-4 text-white" />
        </button>

        {/* Directorate Brand & Active Module Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-white/90 hidden lg:inline">
            شارەوانییەکانی گەرمیان
          </span>
          <span className="text-white/40 hidden lg:inline">/</span>
          <span className="font-bold text-white tracking-wide truncate max-w-[160px] sm:max-w-none">
            {getCurrentModuleName()}
          </span>
        </div>
      </div>

      {/* CENTER: Multi-Municipality Switcher & Quick Role Switcher */}
      <div className="flex items-center gap-2">
        {/* 1. Quick Persona Switcher Dropdown (7 Roles) */}
        <div className="relative">
          <button
            onClick={() => {
              setPersonaSwitcherOpen(!personaSwitcherOpen);
              setMuniDropdownOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 rounded bg-amber-400/20 hover:bg-amber-400/30 px-2.5 py-1 text-xs text-white transition-colors border border-amber-300/30 cursor-pointer"
            title="گۆڕینی ئەکاونت و ڕۆڵی بەکارهێنەر لەناو سیستەم"
          >
            {switchingRole ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 text-amber-300" />
            )}
            <span className="font-bold text-[11px] hidden sm:inline text-amber-100">
              گۆڕینی ئەکاونت
            </span>
            <ChevronDown className="h-3 w-3 text-amber-200" />
          </button>

          {personaSwitcherOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPersonaSwitcherOpen(false)}
              />
              <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5 w-72 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>گۆڕینی ڕاستەوخۆی ڕۆڵ (٧ ئەکاونت)</span>
                  <span className="font-mono text-[9px] text-[#017E84] font-bold">1-Click</span>
                </div>
                {personaOptions.map((p) => {
                  const isCurrent =
                    currentUser?.role === p.role &&
                    (p.key === "DG" ? isHq : true);
                  return (
                    <button
                      key={p.key}
                      onClick={() => {
                        setPersonaSwitcherOpen(false);
                        handleSwitchPersona(p.key);
                      }}
                      className={cn(
                        "w-full text-right p-2 rounded flex items-center justify-between transition-colors cursor-pointer",
                        isCurrent
                          ? "bg-teal-50 dark:bg-teal-950/40 border border-[#017E84]/30"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{p.title}</span>
                          {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-[#017E84]" />}
                        </div>
                        <div className="text-[10px] text-slate-500">{p.muni}</div>
                      </div>
                      <span className="odoo-badge-pending text-[9px] py-0 px-1 font-mono">
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. Multi-Municipality Jurisdiction Switcher (13 Municipalities) */}
        <div className="relative">
          <button
            onClick={() => {
              setMuniDropdownOpen(!muniDropdownOpen);
              setPersonaSwitcherOpen(false);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 rounded bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs text-white transition-colors border border-white/15 cursor-pointer"
            aria-expanded={muniDropdownOpen}
          >
            <Building2 className="h-3.5 w-3.5 text-emerald-300" />
            <span className="font-bold truncate max-w-[120px] sm:max-w-[180px]">
              {isHq ? "دیوانی بەڕێوەبەرایەتی گشتی" : activeMuniName}
            </span>
            <ChevronDown className="h-3 w-3 text-white/70" />
          </button>

          {/* Multi-Company / Municipality Dropdown */}
          {muniDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMuniDropdownOpen(false)}
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-84 max-h-96 overflow-y-auto rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs text-slate-800 dark:text-slate-200">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span>دەسەڵاتی کارگێڕی (١٣ شارەوانی فەرمی)</span>
                  <span className="font-mono text-[9px] text-[#017E84] font-bold">١٣ لق</span>
                </div>
                {garmianMunicipalities.map((muni) => {
                  const isSelected =
                    muni.nameKrd.includes(activeMuniName) || (muni.isHeadquarter && isHq);
                  return (
                    <button
                      key={muni.id}
                      onClick={() => {
                        setSelectedMuni(muni);
                        setMuniDropdownOpen(false);
                        try {
                          localStorage.setItem("garmian_selected_muni", JSON.stringify(muni));
                          const params = new URLSearchParams(window.location.search);
                          if (muni.isHeadquarter) {
                            params.delete("muni");
                          } else {
                            params.set("muni", muni.id);
                          }
                          const query = params.toString();
                          const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
                          window.history.pushState({}, "", newUrl);
                          window.dispatchEvent(
                            new CustomEvent("garmian-muni-changed", { detail: muni })
                          );
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded px-2.5 py-1.5 text-right text-xs transition-colors mb-0.5 cursor-pointer",
                        isSelected
                          ? "bg-[#017E84] text-white font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      )}
                    >
                      <div className="flex flex-col text-right">
                        <span>{muni.nameKrd}</span>
                        <span className="text-[10px] opacity-75 font-mono">{muni.tier}</span>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* LEFT SIDE (RTL): Activity Bell, Theme Toggle & User Profile */}
      <div className="flex items-center gap-2">
        {/* Notification Activity Bell */}
        <button
          title="ئاگاداری و چالاکییە نوێیەکان"
          className="relative flex h-8 w-8 items-center justify-center rounded hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-emerald-400" />
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <div className="text-white hover:text-white">
          <ThemeToggle />
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setPersonaSwitcherOpen(false);
              setMuniDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded bg-white/10 hover:bg-white/20 px-2 py-1 text-right text-xs transition-colors border border-white/15 cursor-pointer"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#017E84] text-white font-bold text-[10px]">
              <User className="h-3 w-3" />
            </div>
            <span className="hidden sm:inline font-bold text-[11px] text-white truncate max-w-[120px]">
              {currentUser?.fullName || "بەڕێوەبەری سیستەم"}
            </span>
            <ChevronDown className="h-3 w-3 text-white/70" />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-60 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2 text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    {currentUser?.fullName || "ئەندازیار بەرزان محەمەد"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {currentUser?.role || "DIRECTOR_GENERAL"}
                  </p>
                  <div className="mt-1.5">
                    <span className="odoo-badge-approved text-[9px] py-0">
                      {isHq ? "دەسەڵاتی سەرتاسەری" : "دەسەڵاتی ناوچەیی"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-right text-xs text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold cursor-pointer"
                >
                  <span>دەرچوون (Log Out)</span>
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ODOO ENTERPRISE APP MATRIX OVERLAY (Waffle Drawer) */}
      {appSwitcherOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            onClick={() => setAppSwitcherOpen(false)}
          />
          <div className="fixed top-12 right-0 left-0 z-50 p-6 sm:p-10 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-right">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    مۆدیوول و ئەپڵیکەیشنەکانی Odoo Gov ERP
                  </h3>
                  <p className="text-xs text-slate-500">
                    بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان
                  </p>
                </div>
                <button
                  onClick={() => setAppSwitcherOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* App Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {odooApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <Link
                      key={app.name}
                      href={app.href}
                      onClick={() => setAppSwitcherOpen(false)}
                      className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-[#017E84] hover:shadow-md transition-all group text-center"
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm transition-transform group-hover:scale-105",
                          app.bg
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#017E84]">
                        {app.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
