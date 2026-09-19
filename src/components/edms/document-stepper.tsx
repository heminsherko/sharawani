"use client";

import * as React from "react";
import {
  Send,
  Inbox,
  Search,
  CheckCheck,
  Archive,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { DocumentStatus } from "@prisma/client";

interface DocumentStepperProps {
  currentStep: number; // 1 to 5
  status: DocumentStatus;
}

const STEPS = [
  {
    step: 1,
    title: "نێردراو",
    desc: "دەرچوونی نوسراو لە شارەوانی سەرچاوە",
    icon: Send,
  },
  {
    step: 2,
    title: "گەیشتووە",
    desc: "وەرگیرانی نوسراو لەلایەن شوێنی مەبەست",
    icon: Inbox,
  },
  {
    step: 3,
    title: "لەژێر وردبینی",
    desc: "پشکنینی هونەری و لێکۆڵینەوەی لیژنە",
    icon: Search,
  },
  {
    step: 4,
    title: "ڕەزامەندی بەڕێوەبەری گشتی",
    desc: "واژوو و بڕیاری کارگێڕی باڵا",
    icon: CheckCheck,
  },
  {
    step: 5,
    title: "تەواوکراو / ئەرشیف",
    desc: "تەواوبوونی گەشت و تۆمارکردن لە ئەرشیف",
    icon: Archive,
  },
];

export function DocumentStepper({ currentStep, status }: DocumentStepperProps) {
  const isRejected = status === "REJECTED";

  return (
    <div className="w-full py-4 text-right">
      {/* Desktop Horizontal Stepper */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line */}
        <div className="absolute top-5 left-6 right-6 -z-0 h-1 bg-muted">
          <div
            className={`h-full transition-all duration-500 ${
              isRejected ? "bg-red-500" : "bg-emerald-600"
            }`}
            style={{
              width: `${Math.max(0, Math.min(100, ((currentStep - 1) / 4) * 100))}%`,
            }}
          />
        </div>

        {STEPS.map((item) => {
          const Icon = item.icon;
          const isCompleted = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div
              key={item.step}
              className="relative z-10 flex flex-col items-center group"
            >
              {/* Step Circle */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-md ${
                  isRejected && isCurrent
                    ? "border-red-500 bg-red-500 text-white shadow-red-500/30"
                    : isCompleted
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-emerald-600/30"
                    : isCurrent
                    ? "border-emerald-600 bg-card text-emerald-600 ring-4 ring-emerald-500/20 shadow-lg scale-110 font-bold"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : isRejected && isCurrent ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2.5 text-center max-w-[110px]">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.title}
                </p>
                <p className="hidden md:block text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

