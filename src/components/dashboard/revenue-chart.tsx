"use client";

import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Coins, Building2 } from "lucide-react";
import { MunicipalityRevenueComparison } from "@/actions/dashboard";

interface RevenueChartProps {
  data: MunicipalityRevenueComparison[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="text-xs text-slate-500 font-medium">چاوەڕوانبە بۆ بارکردنی داتای داهات...</div>
      </div>
    );
  }

  // Custom Kurdish Tooltip (Strict Gov ERP formatting)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as MunicipalityRevenueComparison;
      return (
        <div className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-md text-right text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-end gap-1">
            <span>{item.nameKrd}</span>
            <Building2 className="h-3 w-3 text-slate-500" />
          </p>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
            <p className="text-[11px] text-slate-500 flex justify-between gap-3">
              <span>داهاتی تۆمارکراو:</span>
              <span className="font-mono font-bold text-[#0F2942] dark:text-amber-400">
                {item.revenue.toLocaleString()} ملیۆن IQD
              </span>
            </p>
            <p className="text-[10px] text-slate-400 flex justify-between gap-3">
              <span>ژمارەی پسوولە:</span>
              <span className="font-mono">{item.invoiceCount} پسوولە</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right space-y-0">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F2942] dark:text-slate-300 flex items-center justify-center">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F2942] dark:text-slate-100">
              بەراوردی داهاتی شارەوانییەکان (Comparative Revenue Analytics)
            </h3>
            <p className="text-[10px] text-slate-500">
              کۆی گشتی باج و پسوولەی وەرگیراو بە ملیۆن دیناری عێراقی (IQD)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#0F2942]" />
            <span>ناوەندی سەرەکی</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-slate-500" />
            <span>شارەوانی لق</span>
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-3.5 pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={false}
                stroke="#E2E8F0"
                opacity={0.6}
              />
              <XAxis
                dataKey="nameKrd"
                tick={{ fill: "#64748B", fontSize: 10, fontWeight: 500 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={35}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 10, fontFamily: "monospace" }}
                tickFormatter={(value) => `${value}M`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[2, 2, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.nameEng && entry.nameEng.includes("Kalar")
                        ? "#714B67"
                        : entry.nameEng && entry.nameEng.includes("Kifri")
                        ? "#017E84"
                        : "#A887A0"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
