import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">پەڕەی داواکراو نەدۆزرایەوە (404)</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        ئەو پەڕەیەی بەدوایدا دەگەڕێیت سڕاوەتەوە یان ناونیشانەکەی بە هەڵە نووسراوە.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition-colors"
      >
        <span>گەڕانەوە بۆ پەڕەی سەرەکی</span>
        <ArrowRight className="h-4 w-4 rotate-180" />
      </Link>
    </div>
  );
}

