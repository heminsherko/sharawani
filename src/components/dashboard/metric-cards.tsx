"use client";

import * as React from "react";
import {
  Coins,
  HardHat,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { DashboardMetrics } from "@/actions/dashboard";

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const cards = [
    {
      title: "داهاتی ئەمڕۆ لە سەرتاسەری گەرمیان",
      subTitle: "کۆکراوەی داهاتی فەرمی لە ١٣ شارەوانی (IQD)",
      value: metrics.todayRevenueFormatted,
      isMono: true,
      badgeText: metrics.revenueChangePercent,
      badgeClass: "odoo-badge-approved",
      icon: Coins,
      accentColor: "border-t-3 border-t-[#714B67] text-[#714B67]",
      iconBg: "bg-[#F3EDF2] text-[#714B67] dark:bg-purple-950/40 dark:text-purple-300",
    },
    {
      title: "پڕۆژە ئەندازیارییە بەردەوامەکان",
      subTitle: `${metrics.ongoingProjectsCount} لە جێبەجێکردندان • ${metrics.tenderProjectsCount} لە قۆناغی تەندەردا`,
      value: `${metrics.activeProjectsCount} پڕۆژە`,
      isMono: false,
      badgeText: "چالاک",
      badgeClass: "odoo-badge-approved",
      icon: HardHat,
      accentColor: "border-t-3 border-t-[#017E84] text-[#017E84]",
      iconBg: "bg-[#E2F7F2] text-[#017E84] dark:bg-teal-950/40 dark:text-teal-300",
    },
    {
      title: "نوسراوە لە چاوەڕوانی واژووی بڕیاربەدەست",
      subTitle: "نوسراوی EDMS پێویست بە واژووی بەڕێوەبەری گشتی",
      value: `${metrics.pendingApprovalsCount} نوسراو`,
      isMono: false,
      badgeText: "لە چاوەڕوانی واژوو",
      badgeClass: "odoo-badge-pending",
      icon: Clock,
      accentColor: "border-t-3 border-t-amber-600 text-amber-600",
      iconBg: "bg-[#FEF6E0] text-[#9A6700] dark:bg-amber-950/40 dark:text-amber-300",
    },
    {
      title: "ڕاپۆرتی سەرپێچی و زیادەڕۆیی",
      subTitle: "سەرپێچییە تۆمارکراوەکانی سنووری ١٣ شارەوانی",
      value: `${metrics.weeklyViolationsCount} سەرپێچی`,
      isMono: false,
      badgeText: "پێویست بە لادان",
      badgeClass: "odoo-badge-rejected",
      icon: AlertTriangle,
      accentColor: "border-t-3 border-t-rose-600 text-rose-600",
      iconBg: "bg-[#FDE8E8] text-[#9B1C1C] dark:bg-rose-950/40 dark:text-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-right">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`rounded border border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2.5 shadow-xs ${card.accentColor}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {card.title}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {card.subTitle}
                </span>
              </div>
              <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
              <div
                className={`text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 ${
                  card.isMono ? "font-mono" : ""
                }`}
              >
                {card.value}
              </div>
              <span className={card.badgeClass}>
                {card.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
