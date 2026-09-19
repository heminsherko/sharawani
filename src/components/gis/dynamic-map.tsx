"use client";

import dynamic from "next/dynamic";
import { ParcelDTO } from "@/actions/parcels";

// Dynamic client import with SSR disabled to prevent Leaflet window errors
const GarmianMap = dynamic(() => import("./garmian-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-muted/30">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs font-bold text-muted-foreground">
          بارکردنی نەخشەی ئەلیکترۆنی GIS و تەنسیقاتی گەرمیان...
        </p>
      </div>
    </div>
  ),
});

export default GarmianMap;

