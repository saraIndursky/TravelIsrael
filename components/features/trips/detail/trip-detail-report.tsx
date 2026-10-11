"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReportType } from "@/types";
import { REPORT_TYPE_LABELS } from "@/types/enums";

const REPORT_TYPES: ReportType[] = ["problem", "inaccuracy", "update"];

interface TripDetailReportProps {
  onSubmit: (reportType: ReportType, reason: string) => Promise<void>;
  canReport: boolean;
}

export function TripDetailReport({ onSubmit, canReport }: TripDetailReportProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("problem");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!canReport) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-sm border border-[#e5e7eb] px-4 py-2.5 text-sm text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111827]"
      >
        <Flag className="h-4 w-4" />
        דיווח על בעיה
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white text-[#111827] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>שליחת דיווח</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              await onSubmit(reportType, reason);
              setSubmitting(false);
              setReason("");
              setReportType("problem");
              setOpen(false);
            }}
          >
            <div>
              <p className="mb-2 text-sm text-[#6b7280]">סוג הדיווח</p>
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                      reportType === type
                        ? "bg-[#111827] text-white"
                        : "border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb]"
                    }`}
                  >
                    {REPORT_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="פרטי נוספים על הדיווח..."
              className="min-h-[120px] w-full rounded-sm border border-[#d1d5db] p-3 text-sm focus:border-[#111827] focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
            >
              שליחת דיווח
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
