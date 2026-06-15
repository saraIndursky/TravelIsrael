"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Link2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface TripImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export function TripImageField({ value, onChange, error }: TripImageFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<"upload" | "link">("upload");

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    },
    [onChange]
  );

  const previewSrc = value.trim();

  return (
    <div className="space-y-3">
      <Label>תמונת הטיול</Label>

      <div className="flex gap-2">
        {(
          [
            { id: "upload" as const, label: "העלאה / גרירה" },
            { id: "link" as const, label: "קישור" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tab === id
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* דסקטופ RTL: עמודה 1 = גרירה (ימין), עמודה 2 = תצוגה מקדימה (שמאל) */}
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_11rem] md:items-stretch md:gap-5"
      >
        <div className="min-h-[11rem] min-w-0">
            {tab === "link" ? (
              <div className="flex h-full min-h-[11rem] flex-col justify-center rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
                <p className="mb-2 flex items-center gap-2 text-sm text-[#6b7280]">
                  <Link2 className="h-4 w-4" />
                  קישור לתמונה (URL)
                </p>
                <Input
                  type="url"
                  value={previewSrc.startsWith("data:") ? "" : value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://..."
                  className="text-start"
                  dir="ltr"
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={async (e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) await handleFile(file);
                }}
                className={cn(
                  "flex h-full min-h-[11rem] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-4 transition-colors",
                  dragOver ? "border-[#111827] bg-[#f9fafb]" : "border-[#d1d5db] bg-[#fafafa]"
                )}
              >
                <Upload className="mb-2 h-7 w-7 text-[#9ca3af]" />
                <p className="mb-1 text-sm text-[#4b5563]">גרור תמונה לכאן</p>
                <p className="mb-3 text-xs text-[#9ca3af]">או</p>
                <label className="cursor-pointer rounded-lg border border-[#111827] px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]">
                  בחר קובץ
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleFile(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
          </div>

        <div className="relative min-h-[11rem] w-full overflow-hidden rounded-lg border bg-gray-100 md:w-[11rem] md:shrink-0">
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt="תצוגה מקדימה"
                fill
                className="object-cover"
                sizes="176px"
                unoptimized={previewSrc.startsWith("data:")}
              />
            ) : (
              <div className="flex h-full min-h-[11rem] items-center justify-center text-sm text-gray-400">
                תצוגה מקדימה
              </div>
            )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
