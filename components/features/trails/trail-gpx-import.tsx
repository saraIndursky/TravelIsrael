"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createTrail } from "@/lib/data/trails";
import { gpxImportToCreateTrailInput, parseGpx, readGpxFile } from "@/lib/utils/gpx";
import { trailEditPath } from "@/lib/utils/content-path";

export function TrailGpxImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || importing) return;

    setImporting(true);
    try {
      const xml = await readGpxFile(file);
      const parsed = parseGpx(xml);
      const payload = gpxImportToCreateTrailInput(parsed, { fileName: file.name });
      const trail = await createTrail(payload);
      toast({
        title: "המסלול נוצר מהקובץ",
        description: "השלימו פרטים ושמרו לשליחה לאישור",
      });
      router.push(trailEditPath(trail));
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "ייבוא GPX נכשל",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mb-8 rounded-lg border border-dashed border-[#d1d5db] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">ייבוא מקובץ GPX</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            העלו קובץ GPX — ניצור מסלול עם נקודות מהקובץ ונעביר לעריכה להשלמת פרטים
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".gpx,application/gpx+xml"
            className="sr-only"
            id="trail-gpx-import"
            disabled={importing}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="trail-gpx-import"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#374151] ${
              importing ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Upload className="h-4 w-4" />
            {importing ? "מייבא..." : "בחירת קובץ GPX"}
          </label>
        </div>
      </div>
    </div>
  );
}
