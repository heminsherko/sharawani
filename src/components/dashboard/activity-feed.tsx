"use client";

import * as React from "react";
import {
  Activity,
  Coins,
  MapPin,
  FileText,
  HardHat,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import { ActivityFeedItem } from "@/actions/dashboard";

interface ActivityFeedProps {
  activities: ActivityFeedItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "revenue":
        return {
          icon: Coins,
          badge: "gov-badge-approved",
          label: "دارایی",
        };
      case "land":
        return {
          icon: MapPin,
          badge: "rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 font-bold",
          label: "زەوی (GIS)",
        };
      case "edms":
        return {
          icon: FileText,
          badge: "gov-badge-pending",
          label: "نوسراو",
        };
      case "project":
        return {
          icon: HardHat,
          badge: "rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-1.5 py-0.5 font-bold",
          label: "ئەندازە",
        };
      default:
        return {
          icon: AlertTriangle,
          badge: "gov-badge-rejected",
          label: "سەرپێچی",
        };
    }
  };

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right space-y-0">
      {/* Feed Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F2942] dark:text-slate-300 flex items-center justify-center">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F2942] dark:text-slate-100">
              تۆماری چالاکییە کارگێڕییەکان (Live Audit Trail)
            </h3>
            <p className="text-[10px] text-slate-500">
              لۆگی بەردەوامی مامەڵە فەرمییەکانی ١٣ شارەوانی
            </p>
          </div>
        </div>

        <span className="gov-badge-approved text-[10px]">
          چاودێری ڕاستەوخۆ
        </span>
      </div>

      {/* Activities List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
        {activities.map((item) => {
          const config = getCategoryConfig(item.category);

          return (
            <div
              key={item.id}
              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {item.municipalityName}
                  </span>
                  <span className={config.badge}>
                    {config.label}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  <span>{item.timestamp}</span>
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal font-medium">
                {item.actionText}
              </p>

              {item.userName && (
                <div className="font-mono text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 inline-flex items-center gap-1">
                  <User className="h-2.5 w-2.5" />
                  <span>فەرمانبەر: {item.userName}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
