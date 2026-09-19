"use client";

import * as React from "react";
import {
  MessageSquare,
  FileText,
  Clock,
  User,
  Send,
  Paperclip,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatterActivity {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  type: "note" | "audit" | "approval";
}

const defaultActivities: ChatterActivity[] = [
  {
    id: "ch-1",
    author: "فەرمانبەری زەویوزار و کاداستر",
    role: "LAND_OFFICER",
    timestamp: "پێش ١٠ خولەک",
    content: "فەرمانبەری زەویوزار: سنووری کاداستری نوێکردەوە و ڕەزامەندی نەخشەی دا.",
    type: "audit",
  },
  {
    id: "ch-2",
    author: "ئەندازیاری سەرپەرشتیار (بەشی ئەندازە)",
    role: "ENGINEER",
    timestamp: "پێش ٣٥ خولەک",
    content: "ئەندازیاری سەرپەرشتیار: پشکنینی مەیدانی تەواوکرد و دۆسیەکە ئاڕاستەی دیوانی گشتی کرا بۆ پەسەندکردنی کۆتایی.",
    type: "note",
  },
  {
    id: "ch-3",
    author: "ئەندازیار بەرزان محەمەد (بەڕێوەبەری گشتی)",
    role: "DIRECTOR_GENERAL",
    timestamp: "پێش ١ کاتژمێر",
    content: "بەڕێوەبەری گشتی: واژووی پەسەندکردنی چەسپاند و پسوولەی دارایی ڕێگەپێدراو دەرچوو.",
    type: "approval",
  },
];

interface OdooChatterProps {
  recordTitle?: string;
  initialActivities?: ChatterActivity[];
}

export function OdooChatter({
  recordTitle,
  initialActivities = defaultActivities,
}: OdooChatterProps) {
  const [activeTab, setActiveTab] = React.useState<"notes" | "audit">("notes");
  const [noteInput, setNoteInput] = React.useState("");
  const [activities, setActivities] = React.useState<ChatterActivity[]>(initialActivities);
  const [isComposing, setIsComposing] = React.useState(false);

  function handleSendNote() {
    if (!noteInput.trim()) return;
    const newAct: ChatterActivity = {
      id: "ch-" + Date.now(),
      author: "بەڕێوەبەری سیستەم (تۆ)",
      role: "DIRECTOR_GENERAL",
      timestamp: "ئێستا",
      content: noteInput.trim(),
      type: "note",
    };
    setActivities([newAct, ...activities]);
    setNoteInput("");
    setIsComposing(false);
  }

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "notes") return act.type === "note" || act.type === "approval";
    if (activeTab === "audit") return act.type === "audit";
    return true;
  });

  return (
    <div className="rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-right overflow-hidden font-sans">
      {/* Odoo Chatter Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-[#F8F9FA] dark:bg-slate-850">
        <div className="flex items-center gap-2">
          {/* Tab 1: Log Note */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("notes");
              setIsComposing(true);
            }}
            className={cn(
              "py-1 px-3 text-xs font-bold inline-flex items-center gap-1.5 rounded transition-all cursor-pointer",
              activeTab === "notes"
                ? "bg-[#017E84] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>تێبینییە کارگێڕییەکان (Log Note)</span>
          </button>

          {/* Tab 2: Audit History */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("audit");
              setIsComposing(false);
            }}
            className={cn(
              "py-1 px-3 text-xs font-bold inline-flex items-center gap-1.5 rounded transition-all cursor-pointer",
              activeTab === "audit"
                ? "bg-[#714B67] text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>مێژووی کردارەکان (Audit History)</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-[#017E84]" />
          <span>تۆماری فەرمی وردبینی Odoo Chatter</span>
        </div>
      </div>

      {/* Note Composition Box (Odoo Style Input) */}
      {isComposing && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-[#F9F9FB] dark:bg-slate-850/60 animate-in fade-in">
          <div className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs focus-within:border-[#017E84]">
            <textarea
              rows={2}
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="تێبینییە کارگێڕییەکەت بنووسە لێرە (تەنها فەرمانبەرانی ڕێگەپێدراو دەیبینن)..."
              className="w-full p-2.5 text-xs text-slate-900 dark:text-slate-100 bg-transparent resize-none focus:outline-none placeholder:text-slate-400 text-right font-sans"
            />
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">
                پەیوەست دەکرێت بە دۆسیەی: {recordTitle || "تۆماری هەڵبژێردراو"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="button"
                  onClick={handleSendNote}
                  disabled={!noteInput.trim()}
                  className="odoo-btn-primary py-1 px-3 text-xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  <span>تۆمارکردنی تێبینی</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Feed (Timeline stream) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 p-3 space-y-3">
        {filteredActivities.map((act) => (
          <div key={act.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
            {/* Author Avatar Indicator */}
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs",
                act.type === "approval"
                  ? "bg-[#017E84]"
                  : act.type === "audit"
                  ? "bg-[#714B67]"
                  : "bg-slate-600"
              )}
            >
              {act.type === "approval" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : act.type === "audit" ? (
                <Clock className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Content & Metadata */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {act.author}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {act.role}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {act.timestamp}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-[#F8F9FA] dark:bg-slate-800/50 p-2.5 rounded border border-slate-100 dark:border-slate-800 text-[11px]">
                {act.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
