"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Link2, Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uploadContentImage } from "@/lib/data/content-images";
import { toast } from "@/components/ui/use-toast";

interface TripImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
}

export function TripImageField({ value, onChange, error, label = "תמונת הטיול" }: TripImageFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const [tab, setTab] = useState<"upload" | "link">("upload");
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setUploading(true);
      try {
        const url = await uploadContentImage(file);
        onChange(url);
        toast({ title: "התמונה הועלתה" });
      } catch (err) {
        toast({
          title: err instanceof Error ? err.message : "העלאת התמונה נכשלה",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const previewSrc = value.trim();
  const isDataUrl = previewSrc.startsWith("data:");

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      <div className="flex gap-2">
        {(
          [
            { id: "upload" as const, label: "העלאה / גרירה" },
            { id: "link" as const, label: "קישור" },
          ] as const
        ).map(({ id, label: tabLabel }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            disabled={uploading}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tab === id
                ? "border-[#111827] bg-[#111827] text-white"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]"
            )}
          >
            {tabLabel}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_11rem] md:items-stretch md:gap-5">
        <div className="min-h-[11rem] min-w-0">
          {tab === "link" ? (
            <div className="flex h-full min-h-[11rem] flex-col justify-center rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
              <p className="mb-2 flex items-center gap-2 text-sm text-[#6b7280]">
                <Link2 className="h-4 w-4" />
                קישור לתמונה (URL)
              </p>
              <Input
                type="url"
                value={isDataUrl ? "" : value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://..."
                className="text-start"
                dir="ltr"
                disabled={uploading}
              />
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!uploading) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                if (uploading) return;
                const file = e.dataTransfer.files[0];
                if (file) await handleFile(file);
              }}
              className={cn(
                "flex h-full min-h-[11rem] flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-4 transition-colors",
                dragOver ? "border-[#111827] bg-[#f9fafb]" : "border-[#d1d5db] bg-[#fafafa]",
                uploading && "opacity-70"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="mb-2 h-7 w-7 animate-spin text-[#9ca3af]" />
                  <p className="text-sm text-[#4b5563]">מעלה תמונה...</p>
                </>
              ) : (
                <>
                  <Upload className="mb-2 h-7 w-7 text-[#9ca3af]" />
                  <p className="mb-1 text-sm text-[#4b5563]">גרור תמונה לכאן</p>
                  <p className="mb-3 text-xs text-[#9ca3af]">או</p>
                  <label className="cursor-pointer rounded-lg border border-[#111827] px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]">
                    בחר קובץ
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#9ca3af]">עד 5MB · JPG / PNG / WEBP / GIF</p>
                </>
              )}
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
              unoptimized={isDataUrl}
            />
          ) : (
            <div className="flex h-full min-h-[11rem] items-center justify-center text-sm text-gray-400">
              תצוגה מקדימה
            </div>
          )}
        </div>
      </div>

      {isDataUrl && (
        <p className="text-xs text-amber-700">
          התמונה הנוכחית שמורה כקובץ ישן. העלו מחדש כדי לשמור ב-Storage.
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
