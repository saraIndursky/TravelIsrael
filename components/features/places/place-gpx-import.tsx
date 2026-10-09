"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createPlace } from "@/lib/data/places";
import { gpxImportToCreatePlaceInput, parseGpx, readGpxFile } from "@/lib/utils/gpx";
import { placeEditPath } from "@/lib/utils/content-path";

export function PlaceGpxImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || importing) return;

    setImporting(true);
    try {
      const xml = await readGpxFile(file);
      const parsed = parseGpx(xml);
      const payload = gpxImportToCreatePlaceInput(parsed, { fileName: file.name });
      const place = await createPlace(payload);
      toast({
        title: "המקום נוצר מהקובץ",
        description: "השלימו פרטים ושמרו לשליחה לאישור",
      });
      router.push(placeEditPath(place));
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
            העלו קובץ GPX — ניצור מקום עם מיקום מהקובץ ונעביר לעריכה להשלמת פרטים
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".gpx,application/gpx+xml"
            className="sr-only"
            id="place-gpx-import"
            disabled={importing}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="place-gpx-import"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border border-[#111827] bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#374151] ${
              importing ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Upload className="h-4 w-4" />
            {importing ? "מייבא..." : "בחר קובץ GPX"}
          </label>
        </div>
      </div>
    </div>
  );
}
