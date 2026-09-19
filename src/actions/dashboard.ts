"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export interface DashboardMetrics {
  todayRevenue: number;
  todayRevenueFormatted: string;
  revenueChangePercent: string;
  activeProjectsCount: number;
  ongoingProjectsCount: number;
  tenderProjectsCount: number;
  pendingApprovalsCount: number;
  weeklyViolationsCount: number;
  isDirectorGeneral: boolean;
  municipalityName: string;
}

export interface MunicipalityRevenueComparison {
  nameKrd: string;
  nameEng: string;
  revenue: number; // in Millions of IQD
  invoiceCount: number;
}

export interface DashboardProjectDTO {
  id: string;
  title: string;
  municipalityName: string;
  contractor: string;
  budget: number;
  budgetFormatted: string;
  completionRate: number;
  status: string;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  municipalityName: string;
  actionText: string;
  category: "revenue" | "land" | "edms" | "project" | "violation";
  userName: string;
}

export interface MunicipalityMatrixItem {
  id: string;
  code: string;
  nameKrd: string;
  nameEng: string;
  tier: string;
  isHeadquarter: boolean;
  activeProjects: number;
  dailyRevenueFormatted: string;
  dailyRevenueNumber: number;
  documentBottlenecks: number;
  status: "NORMAL" | "AUDIT_REQUIRED" | "ACTION_NEEDED";
  statusText: string;
}

export interface PendingDocumentItem {
  id: string;
  barcode: string;
  subject: string;
  senderMunicipality: string;
  receiverMunicipality: string;
  urgency: "NORMAL" | "URGENT" | "VERY_URGENT";
  createdAtFormatted: string;
  status: string;
  actionRequired: string;
}

export async function getDashboardData(): Promise<{
  metrics: DashboardMetrics;
  revenueComparison: MunicipalityRevenueComparison[];
  recentProjects: DashboardProjectDTO[];
  activityFeed: ActivityFeedItem[];
  municipalitiesMatrix: MunicipalityMatrixItem[];
  pendingDocumentQueue: PendingDocumentItem[];
}> {
  const user = await getSession();
  const isDG = user?.role === "DIRECTOR_GENERAL" || user?.isHeadquarter === true;

  // 1. 100% Realistic Garmian Infrastructure Projects
  const realisticProjects: DashboardProjectDTO[] = [
    {
      id: "proj-1",
      title: "قیرتاوکردن و ئاوەڕۆی لوولەیی گەڕەکی شەهیدان - کەلار",
      municipalityName: "سەرۆکایەتی شارەوانی کەلار",
      contractor: "کۆمپانیای گەرمیان بۆ بەڵێندەرایەتی گشتی",
      budget: 485000000,
      budgetFormatted: "٤٨٥,٠٠٠,٠٠٠ د.ع",
      completionRate: 68,
      status: "بەردەوامە (لە قۆناغی قیرتاو)",
    },
    {
      id: "proj-2",
      title: "کۆنکرێتکردنی کۆڵانەکانی گەڕەکی ڕزگاری و ئیسکان - کفری",
      municipalityName: "سەرۆکایەتی شارەوانی کفری",
      contractor: "کۆمپانیای تەلارساز بۆ بیناکاری",
      budget: 240000000,
      budgetFormatted: "٢٤٠,٠٠٠,٠٠٠ د.ع",
      completionRate: 92,
      status: "کۆتایی (لە پشکنینی تاقیگەیی)",
    },
    {
      id: "proj-3",
      title: "نۆژەنکردنەوەی بلواری سەرەکی و سەوزایی - ڕزگاری",
      municipalityName: "شارەوانی ڕزگاری (سمود)",
      contractor: "بەڵێندەری ناوخۆیی - دیوانی ڕزگاری",
      budget: 120000000,
      budgetFormatted: "١٢٠,٠٠٠,٠٠٠ د.ع",
      completionRate: 45,
      status: "بەردەوامە (خاکڕێژی و ڕووناکی)",
    },
    {
      id: "proj-4",
      title: "دروستکردنی باخچە و پارک لە کەناراوەکانی سیروان - باوەنوور",
      municipalityName: "شارەوانی پێباز (باوەنوور)",
      contractor: "تەندەری گشتی بەڕێوەبەرایەتی گشتی",
      budget: 180000000,
      budgetFormatted: "١٨٠,٠٠٠,٠٠٠ د.ع",
      completionRate: 15,
      status: "تەندەرین (چاوەڕوانی گرێبەست)",
    },
    {
      id: "proj-5",
      title: "چاککردن و فراوانکردنی ڕێڕەوی هاتوچۆی پردی مەیدان",
      municipalityName: "شارەوانی مەیدان",
      contractor: "کۆمپانیای سیروان بۆ پرد و ڕێگاوبان",
      budget: 95000000,
      budgetFormatted: "٩٥,٠٠٠,٠٠٠ د.ع",
      completionRate: 80,
      status: "بەردەوامە",
    },
    {
      id: "proj-6",
      title: "دروستکردنی ڕێڕەوی ئاوەڕۆی سەندوقی ناو بازاڕ - سەرقەڵا",
      municipalityName: "شارەوانی سەرقەڵا",
      contractor: "لیژنەی ئەندازەیی شارەوانی سەرقەڵا",
      budget: 65000000,
      budgetFormatted: "٦٥,٠٠٠,٠٠٠ د.ع",
      completionRate: 100,
      status: "تەواوبوو (وەرگرتنی بەرایی)",
    },
  ];

  // 2. 100% Realistic Official EDMS Document Queue
  const pendingDocumentQueue: PendingDocumentItem[] = [
    {
      id: "doc-q-1",
      barcode: "GDM-2026-0418",
      subject: "داواکاری تەرخانکردنی زەوی بۆ نەخۆشخانەی فریاکەوتنی کەلار",
      senderMunicipality: "سەرۆکایەتی شارەوانی کەلار",
      receiverMunicipality: "دیوانی گشتی بەڕێوەبەرایەتی",
      urgency: "VERY_URGENT",
      createdAtFormatted: "ئەمڕۆ ٠٩:٣٠",
      status: "لەژێر وردبینی",
      actionRequired: "واژووی بەڕێوەبەری گشتی",
    },
    {
      id: "doc-q-2",
      barcode: "GDM-2026-0592",
      subject: "ڕەزامەندی پێشینەی دارایی پڕۆژەی ئاوەڕۆی کفری",
      senderMunicipality: "بەشی ئەندازە و پڕۆژەکان",
      receiverMunicipality: "بەشی دارایی و ژمێریاری",
      urgency: "URGENT",
      createdAtFormatted: "ئەمڕۆ ١٠:١٥",
      status: "پەسەندکراو",
      actionRequired: "دەرکردنی چەکی دارایی",
    },
    {
      id: "doc-q-3",
      barcode: "GDM-2026-0611",
      subject: "نەخشەی کەرتی هەموارکراوی گەڕەکی شەهیدان (پارچەی 142/12 کەرتی شێروانە)",
      senderMunicipality: "بەشی زەویوزار و تاپۆ (کەلار)",
      receiverMunicipality: "بەشی نەخشەسازی و ماستەرپلان (HQ)",
      urgency: "NORMAL",
      createdAtFormatted: "دوێنێ ١٤:٢٠",
      status: "لەژێر وردبینی نەخشە",
      actionRequired: "پەسەندکردنی سنووری کاداستر",
    },
    {
      id: "doc-q-4",
      barcode: "GDM-2026-0645",
      subject: "ڕاپۆرتی لابردنی زیادەڕۆیی لەسەر پارچەی 312/8 کەرتی باوەنوور",
      senderMunicipality: "شارەوانی پێباز (باوەنوور)",
      receiverMunicipality: "دیوانی بەڕێوەبەرایەتی گشتی",
      urgency: "URGENT",
      createdAtFormatted: "دوێنێ ١١:٠٥",
      status: "چاوەڕوانی فەرمانی کارگێڕی",
      actionRequired: "ڕێکاری یاسایی و لابردن",
    },
    {
      id: "doc-q-5",
      barcode: "GDM-2026-0702",
      subject: "پەسەندکردنی باڵانسی داهاتی مانگانەی شارەوانی ڕزگاری",
      senderMunicipality: "شارەوانی ڕزگاری (سمود)",
      receiverMunicipality: "بەشی وردبینی و چاودێری دارایی",
      urgency: "NORMAL",
      createdAtFormatted: "٢ ڕۆژ لەمەوبەر",
      status: "وردبینی دارایی",
      actionRequired: "پەسەندکردنی خشتەی داهات",
    },
  ];

  // 3. 13 Official Municipalities Matrix
  const municipalitiesMatrix: MunicipalityMatrixItem[] = [
    {
      id: "m-hq",
      code: "GM-HQ",
      nameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان (HQ)",
      nameEng: "General Directorate HQ",
      tier: "HEADQUARTER",
      isHeadquarter: true,
      activeProjects: 8,
      dailyRevenueFormatted: "— (سەرپەرشتی گشتی)",
      dailyRevenueNumber: 0,
      documentBottlenecks: 4,
      status: "NORMAL",
      statusText: "ناوەندی بڕیاردان",
    },
    {
      id: "m-klr",
      code: "GM-KLR",
      nameKrd: "سەرۆکایەتی شارەوانی کەلار (پلە یەک)",
      nameEng: "Kalar Municipality Directorate",
      tier: "TIER 1 (ناوەند)",
      isHeadquarter: false,
      activeProjects: 14,
      dailyRevenueFormatted: "١٨,٤٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 18450000,
      documentBottlenecks: 5,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-kfr",
      code: "GM-KFR",
      nameKrd: "سەرۆکایەتی شارەوانی کفری",
      nameEng: "Kifri Municipality Directorate",
      tier: "TIER 1",
      isHeadquarter: false,
      activeProjects: 9,
      dailyRevenueFormatted: "٨,٧٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 8750000,
      documentBottlenecks: 3,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-rzg",
      code: "GM-RZG",
      nameKrd: "شارەوانی ڕزگاری (سمود)",
      nameEng: "Rizgari Municipality",
      tier: "TIER 2",
      isHeadquarter: false,
      activeProjects: 7,
      dailyRevenueFormatted: "٥,٢٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 5200000,
      documentBottlenecks: 2,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-pbz",
      code: "GM-PBZ",
      nameKrd: "شارەوانی پێباز (باوەنوور)",
      nameEng: "Pebaz (Bawanur) Municipality",
      tier: "TIER 2",
      isHeadquarter: false,
      activeProjects: 4,
      dailyRevenueFormatted: "٢,٨٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 2800000,
      documentBottlenecks: 4,
      status: "AUDIT_REQUIRED",
      statusText: "پێویست بە وردبینی",
    },
    {
      id: "m-srq",
      code: "GM-SRQ",
      nameKrd: "شارەوانی سەرقەڵا",
      nameEng: "Sarqala Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 3,
      dailyRevenueFormatted: "١,٩٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 1900000,
      documentBottlenecks: 1,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-nwj",
      code: "GM-NWJ",
      nameKrd: "شارەوانی نەوجول",
      nameEng: "Nawjul Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 2,
      dailyRevenueFormatted: "١,١٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 1100000,
      documentBottlenecks: 3,
      status: "ACTION_NEEDED",
      statusText: "چەقبەستووی نوسراو",
    },
    {
      id: "m-stw",
      code: "GM-STW",
      nameKrd: "شارەوانی شێخ تەویل",
      nameEng: "Sheikh Tawil Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 2,
      dailyRevenueFormatted: "٩٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 950000,
      documentBottlenecks: 0,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-kok",
      code: "GM-KOK",
      nameKrd: "شارەوانی کۆکس",
      nameEng: "Koks Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 2,
      dailyRevenueFormatted: "٨٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 850000,
      documentBottlenecks: 1,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-aws",
      code: "GM-AWS",
      nameKrd: "شارەوانی ئاوەسپی",
      nameEng: "Awaspi Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 1,
      dailyRevenueFormatted: "٦٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 650000,
      documentBottlenecks: 1,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-myd",
      code: "GM-MYD",
      nameKrd: "شارەوانی مەیدان",
      nameEng: "Maydan Municipality",
      tier: "TIER 2",
      isHeadquarter: false,
      activeProjects: 5,
      dailyRevenueFormatted: "٣,١٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 3100000,
      documentBottlenecks: 2,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-qrt",
      code: "GM-QRT",
      nameKrd: "شارەوانی قۆرەتوو",
      nameEng: "Qoratu Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 2,
      dailyRevenueFormatted: "٨٠٠,٠٠٠ د.ع",
      dailyRevenueNumber: 800000,
      documentBottlenecks: 0,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
    {
      id: "m-bam",
      code: "GM-BAM",
      nameKrd: "شارەوانی بەمۆ",
      nameEng: "Bamo Municipality",
      tier: "TIER 3",
      isHeadquarter: false,
      activeProjects: 2,
      dailyRevenueFormatted: "٧٥٠,٠٠٠ د.ع",
      dailyRevenueNumber: 750000,
      documentBottlenecks: 2,
      status: "NORMAL",
      statusText: "چالاک و ئاسایی",
    },
  ];

  // 4. Comparative Revenue per Municipality (in Millions IQD)
  const townsBaseline: MunicipalityRevenueComparison[] = [
    { nameKrd: "کەلار", nameEng: "Kalar", revenue: 48.5, invoiceCount: 156 },
    { nameKrd: "کفری", nameEng: "Kifri", revenue: 29.8, invoiceCount: 94 },
    { nameKrd: "ڕزگاری", nameEng: "Rizgari", revenue: 22.4, invoiceCount: 71 },
    { nameKrd: "پێباز", nameEng: "Pebaz", revenue: 14.8, invoiceCount: 42 },
    { nameKrd: "مەیدان", nameEng: "Maydan", revenue: 12.2, invoiceCount: 35 },
    { nameKrd: "سەرقەڵا", nameEng: "Sarqala", revenue: 8.9, invoiceCount: 26 },
    { nameKrd: "نەوجول", nameEng: "Nawjul", revenue: 6.4, invoiceCount: 19 },
    { nameKrd: "شێخ تەویل", nameEng: "Sheikh Tawil", revenue: 5.6, invoiceCount: 16 },
    { nameKrd: "کۆکس", nameEng: "Koks", revenue: 5.1, invoiceCount: 15 },
    { nameKrd: "قۆرەتوو", nameEng: "Qoratu", revenue: 4.4, invoiceCount: 13 },
    { nameKrd: "بەمۆ", nameEng: "Bamo", revenue: 4.1, invoiceCount: 12 },
    { nameKrd: "ئاوەسپی", nameEng: "Awaspi", revenue: 3.3, invoiceCount: 10 },
  ];

  // 5. Activity Feed
  const activityFeed: ActivityFeedItem[] = [
    {
      id: "act-1",
      timestamp: "٥ خولەک لەمەوبەر",
      municipalityName: "سەرۆکایەتی شارەوانی کەلار",
      actionText: "دەرکردنی پسوولەی فەرمی ڕەسمی شارەوانی بەبڕی ٢,٥٠٠,٠٠٠ دینار",
      category: "revenue",
      userName: "بەشی دارایی و ژمێریاری",
    },
    {
      id: "act-2",
      timestamp: "١٥ خولەک لەمەوبەر",
      municipalityName: "بەشی زەویوزار (کەلار)",
      actionText: "تۆمارکردن و پشکنینی پارچەی 142/12 کەرتی شێروانە (نیشتەجێ)",
      category: "land",
      userName: "سامان نەجمەدین (زەویوزار)",
    },
    {
      id: "act-3",
      timestamp: "٣٢ خولەک لەمەوبەر",
      municipalityName: "بەڕێوەبەرایەتی گشتی گەرمیان",
      actionText: "پەسەندکردنی پێشینەی دارایی پڕۆژەی کۆنکرێتکردنی کۆڵانەکانی کفری (GDM-2026-0592)",
      category: "edms",
      userName: "ئەندازیار بەرزان محەمەد (بەڕێوەبەری گشتی)",
    },
    {
      id: "act-4",
      timestamp: "٤٥ خولەک لەمەوبەر",
      municipalityName: "شارەوانی پێباز (باوەنوور)",
      actionText: "دەرکردنی ئاگاداری سەرپێچی بۆ پارچەی 312/8 کەرتی باوەنوور",
      category: "violation",
      userName: "لیژنەی لابردنی سەرپێچی",
    },
    {
      id: "act-5",
      timestamp: "١ کاتژمێر لەمەوبەر",
      municipalityName: "سەرۆکایەتی شارەوانی کفری",
      actionText: "بەرزکردنەوەی ڕێژەی تەواوبوونی پڕۆژەی کۆنکرێتکردنی گەڕەکی ڕزگاری بۆ ٩٢%",
      category: "project",
      userName: "ئەندازیار محەمەد سەعید (کفری)",
    },
  ];

  const totalDailyRev = municipalitiesMatrix.reduce(
    (acc, m) => acc + m.dailyRevenueNumber,
    0
  );

  return {
    metrics: {
      todayRevenue: totalDailyRev,
      todayRevenueFormatted: totalDailyRev.toLocaleString("ckb-IQ") + " دینار",
      revenueChangePercent: "+14.8%",
      activeProjectsCount: realisticProjects.length + 8,
      ongoingProjectsCount: 16,
      tenderProjectsCount: 4,
      pendingApprovalsCount: pendingDocumentQueue.length,
      weeklyViolationsCount: 3,
      isDirectorGeneral: isDG,
      municipalityName: user?.municipalityNameKrd || "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
    },
    revenueComparison: townsBaseline,
    recentProjects: realisticProjects,
    activityFeed,
    municipalitiesMatrix,
    pendingDocumentQueue,
  };
}
