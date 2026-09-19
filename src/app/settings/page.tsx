import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-right space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-600/10 text-slate-600 flex items-center justify-center">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">ڕێکخستنەکان</h1>
          <p className="text-xs text-muted-foreground">ڕێکخستنی سیستەم و بەکارهێنەران</p>
        </div>
      </div>
    </div>
  );
}

