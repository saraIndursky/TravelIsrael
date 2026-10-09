"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { importTravelIsraelTripFromGpx } from "@/lib/utils/gpx-trip-import";
import { readGpxFile } from "@/lib/utils/gpx";
import { tripEditPath } from "@/lib/utils/content-path";

export function TripGpxImport() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file || importing) return;

    setImporting(true);
    try {
      const xml = await readGpxFile(file);
      const trip = await importTravelIsraelTripFromGpx(xml);
      toast({
        title: "הטיול נוצר מהקובץ",
        description: "ניתן לערוך פרטים ולשלוח לאישור",
      });
      router.push(tripEditPath(trip));
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
    <div className="mb-6 rounded-lg border border-dashed border-[#d1d5db] bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">ייבוא טיול מ-GPX</h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            רק מקובץ GPX שייצא מ-TravelIsrael — נשחזר את התחנות ונעביר לעריכת הטיול
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".gpx,application/gpx+xml"
            className="sr-only"
            id="trip-gpx-import"
            disabled={importing}
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <label
            htmlFor="trip-gpx-import"
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
