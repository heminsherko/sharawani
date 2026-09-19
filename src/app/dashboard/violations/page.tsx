import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getViolationsAction } from "@/actions/violations";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  MapPin,
  Clock,
  Radio,
  Building,
  User,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "سەرپێچی و زیادەڕۆیی | شارەوانییەکانی گەرمیان",
  description: "چاودێری و تۆمارکردنی زیادەڕۆیی لەسەر موڵکی گشتی لە گەرمیان",
};

export default async function ViolationsListPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  const violations = await getViolationsAction();

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-foreground">
              سەرپێچی و زیادەڕۆیی لەسەر موڵکی گشتی
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              چاودێری مەیدانی، شوێنگەی GPS و ئاگاداری بەپەلەی سوور بۆ شارەوانییەکان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/violations/new"
            className="rounded-2xl bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-500 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>تۆمارکردنی زیادەڕۆیی مەیدانی (مۆبایل)</span>
          </Link>
        </div>
      </div>

      {/* Grid of Active Violations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {violations.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            هیچ دۆسیەیەکی سەرپێچی چالاک نییە.
          </div>
        ) : (
          violations.map((vio) => (
            <div
              key={vio.id}
              className="rounded-2xl border border-red-500/30 bg-card p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>{vio.parcelNumber}</span>
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {vio.municipalityName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground block">
                  {vio.zone}
                </span>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {vio.description}
                </p>
              </div>

              <div className="border-t border-border/60 pt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>سەرپێچیکار: {vio.offenderName}</span>
                <span>
                  {new Date(vio.createdAt).toLocaleDateString("ku", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="pt-1">
                <Link
                  href="/dashboard/parcels"
                  className="w-full rounded-xl border border-border bg-accent/40 py-2 text-xs font-bold text-foreground hover:bg-accent flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-red-600" />
                  <span>پیشاندان لەسەر نەخشەی سوور (GIS)</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

