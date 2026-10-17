"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Eye,
  MapPin,
  Plus,
  Save,
  Send,
} from "lucide-react";
import type { Status, TripStation, TripWithStations } from "@/types";
import { COMMON_TAGS } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StationPicker } from "@/components/features/trips/station-picker";
import { BuildStationList } from "@/components/features/trips/build-station-list";
import { BuildTripPreviewDialog } from "@/components/features/trips/build-trip-preview-dialog";
import { TripImageField } from "@/components/features/trips/trip-image-field";
import { TimeInput } from "@/components/ui/custom/time-input";
import { TripDetailMap } from "@/components/features/trips/detail/trip-detail-map";
import { createTrip, updateTrip } from "@/lib/data/trips";
import { computeTripStats } from "@/lib/utils/trip-calculations";
import { buildTripMapMarkers } from "@/lib/utils/trip-map";
import {
  calculateSegmentDistances,
  calculateTotalTripMinutes,
  normalizeTravelModes,
} from "@/lib/utils/trip-time";
import { formatDuration } from "@/lib/utils";
import { generateId } from "@/lib/utils/generate-id";
import { tripEditPath, tripPath } from "@/lib/utils/content-path";
import { usePlacesTrailsCatalog } from "@/hooks/use-catalog";
import { tripFormSchema, type TripFormValues } from "@/lib/validations";
import { toast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";
import { TripGpxImport } from "@/components/features/trips/trip-gpx-import";
import {
  buildCreateEntityUrl,
  clearTripCreateDraft,
  loadTripCreateDraft,
  readAddStationFromLocation,
  saveTripCreateDraft,
} from "@/lib/utils/trip-create-draft";

const DEFAULT_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg/1280px-ISR-2016-Makhtesh_Ramon-View_within_the_crater_01.jpg";

interface BuildTripFormProps {
  mode: "create" | "edit";
  tripId?: string;
  initialTrip?: TripWithStations;
  editHint?: string;
}

export function BuildTripForm({ mode, tripId, initialTrip, editHint }: BuildTripFormProps) {
  const router = useRouter();
  const { places, trails, loading: catalogLoading, refresh } = usePlacesTrailsCatalog();
  const [stations, setStations] = useState<TripStation[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [imagePreview, setImagePreview] = useState("");
  const bootstrappedRef = useRef(false);
  const pendingAddRef = useRef<{ type: "place" | "trail"; id: string } | null>(null);

  const returnPath =
    mode === "create" ? "/trips/create" : tripEditPath({ id: tripId ?? "", slug: initialTrip?.slug });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      tags: [],
      main_image: "",
      name: "",
      short_description: "",
      full_description: "",
    },
  });

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const draft = loadTripCreateDraft();
    const addStation = readAddStationFromLocation();

    if (draft) {
      reset(draft.form);
      setStations(normalizeTravelModes(draft.stations));
      setStartTime(draft.startTime);
      setImagePreview(draft.imagePreview);
      clearTripCreateDraft();
    } else if (mode === "edit" && initialTrip) {
      reset({
        name: initialTrip.name,
        short_description: initialTrip.short_description,
        full_description: initialTrip.full_description,
        tags: initialTrip.tags,
        main_image: initialTrip.main_image,
      });
      setStations(normalizeTravelModes(initialTrip.stations));
      setImagePreview(initialTrip.main_image);
    }

    if (addStation) {
      pendingAddRef.current = addStation;
      refresh();
      window.history.replaceState(null, "", draft?.returnPath ?? returnPath);
    }
  }, [mode, initialTrip, reset, refresh, returnPath]);

  useEffect(() => {
    const pending = pendingAddRef.current;
    if (!pending || catalogLoading) return;

    setStations((prev) => {
      const exists = prev.some((station) =>
        pending.type === "place"
          ? station.place_id === pending.id
          : station.trail_id === pending.id
      );
      if (exists) {
        pendingAddRef.current = null;
        return prev;
      }

      const station: TripStation = {
        id: generateId(),
        trip_id: tripId ?? "",
        order_index: prev.length,
        station_type: pending.type,
        place_id: pending.type === "place" ? pending.id : null,
        trail_id: pending.type === "trail" ? pending.id : null,
        travel_mode: "car",
      };
      pendingAddRef.current = null;
      toast({
        title:
          pending.type === "place"
            ? "המקום החדש נוסף לטיול"
            : "המסלול החדש נוסף לטיול",
      });
      return normalizeTravelModes([...prev, station]);
    });
  }, [catalogLoading, places, trails, tripId]);

  const saveDraftAndNavigate = useCallback(
    (entity: "place" | "trail") => {
      saveTripCreateDraft({
        form: getValues(),
        stations,
        startTime,
        imagePreview,
        returnPath,
      });
      setPickerOpen(false);
      router.push(buildCreateEntityUrl(entity, returnPath));
    },
    [getValues, stations, startTime, imagePreview, returnPath, router]
  );

  const selectedTags = watch("tags") ?? [];
  const mainImage = watch("main_image") ?? "";
  const tripName = watch("name") ?? "";
  const shortDescription = watch("short_description") ?? "";
  const fullDescription = watch("full_description") ?? "";
  const displayImage = imagePreview || mainImage;

  const normalizedStations = useMemo(
    () => normalizeTravelModes(stations),
    [stations]
  );

  const totalMinutes = useMemo(
    () => calculateTotalTripMinutes(normalizedStations, places, trails),
    [normalizedStations, places, trails]
  );

  const segmentDistances = useMemo(
    () => calculateSegmentDistances(normalizedStations, places, trails),
    [normalizedStations, places, trails]
  );

  const mapMarkers = useMemo(
    () => buildTripMapMarkers(normalizedStations, places, trails),
    [normalizedStations, places, trails]
  );

  const stats = computeTripStats(normalizedStations, places, trails);

  // Places and trails already in the trip are not offered again, and the picker is sorted by
  // distance from where the trip currently ends.
  const excludedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const station of stations) {
      if (station.place_id) ids.add(station.place_id);
      if (station.trail_id) ids.add(station.trail_id);
    }
    return ids;
  }, [stations]);

  const pickerAnchor = useMemo(() => {
    const last = normalizedStations[normalizedStations.length - 1];
    if (!last) return null;
    if (last.station_type === "place") {
      const place = places.find((p) => p.id === last.place_id);
      return place ? { lat: place.lat, lng: place.lng, name: place.name } : null;
    }
    const trail = trails.find((t) => t.id === last.trail_id);
    return trail ? { lat: trail.end_lat, lng: trail.end_lng, name: trail.name } : null;
  }, [normalizedStations, places, trails]);

  const addStation = (type: "place" | "trail", id: string) => {
    if (excludedIds.has(id)) {
      toast({ title: "התחנה כבר נמצאת בטיול" });
      setPickerOpen(false);
      return;
    }
    const station: TripStation = {
      id: generateId(),
      trip_id: tripId ?? "",
      order_index: stations.length,
      station_type: type,
      place_id: type === "place" ? id : null,
      trail_id: type === "trail" ? id : null,
      travel_mode: "car",
    };
    setStations(normalizeTravelModes([...stations, station]));
    setPickerOpen(false);
  };

  const onSave = async (data: TripFormValues, status: Status) => {
    if (normalizedStations.length === 0) {
      toast({ title: "יש להוסיף לפחות תחנה אחת", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const imageUrl = data.main_image?.trim() || imagePreview || DEFAULT_IMAGE;
      const payload = {
        name: data.name,
        short_description: data.short_description,
        full_description: data.full_description,
        main_image: imageUrl,
        gallery_images: initialTrip?.gallery_images ?? [],
        tags: data.tags,
        status,
        ...stats,
        stations: normalizedStations.map((s, i) => ({
          order_index: i,
          station_type: s.station_type,
          place_id: s.place_id,
          trail_id: s.trail_id,
          travel_mode: s.travel_mode,
        })),
      };

      if (mode === "create") {
        const trip = await createTrip(payload);
        clearTripCreateDraft();
        trackEvent("trip_created", { status, mode: "create" });
        toast({
          title: status === "draft" ? "הטיול נשמר כטיוטה" : "הטיול נשלח לאישור",
        });
        router.push(tripPath(trip));
      } else if (tripId) {
        const result = await updateTrip(tripId, {
          ...payload,
          stations: normalizedStations.map((s, i) => ({ ...s, order_index: i })),
        });
        if (result) {
          toast({
            title:
              status === "draft" && initialTrip?.status === "draft"
                ? "הטיול נשמר כטיוטה"
                : status === "pending"
                  ? "הטיול עודכן ונשלח לאישור"
                  : "הטיול עודכן בהצלחה",
          });
          router.push(tripPath(result));
        } else {
          toast({ title: "שגיאה בעדכון", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "שגיאה בשמירת הטיול", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const pageTitle =
    mode === "create" ? "בניית טיול מותאם אישית" : "עדכון טיול מותאם אישית";

  return (
    <div className="min-h-screen bg-[#f9fafb]" dir="rtl">
      <div className="sticky top-0 z-10 border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-1 text-3xl font-light text-[#111827]">{pageTitle}</h1>
              {editHint ? (
                <p className="text-sm text-[#6b7280]">{editHint}</p>
              ) : (
                <p className="text-[#6b7280]">אפשר להוסיף, להסיר ולשנות את סדר התחנות כרצונכם</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#6b7280]" />
              <span className="text-[#6b7280]">תחנות:</span>
              <span className="font-bold text-[#111827]">{normalizedStations.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#6b7280]" />
              <span className="text-[#6b7280]">זמן כולל:</span>
              <span className="font-bold text-[#111827]">{formatDuration(totalMinutes)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {mode === "create" ? <TripGpxImport /> : null}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <h2 className="mb-6 text-xl font-bold">פרטי הטיול</h2>

              <div className="space-y-4">
                <div>
                  <Label>שם הטיול</Label>
                  <Input
                    {...register("name")}
                    placeholder="שם הטיול"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label>תיאור קצר</Label>
                  <Input
                    {...register("short_description")}
                    placeholder="תיאור קצר לכרטיס הטיול"
                    className="mt-1"
                  />
                  {errors.short_description && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.short_description.message}
                    </p>
                  )}
                </div>

                <TimeInput
                  label="שעת התחלה"
                  value={startTime}
                  onChange={setStartTime}
                  className="w-full"
                />

                <TripImageField
                  value={displayImage}
                  onChange={(url) => {
                    setImagePreview(url);
                    setValue("main_image", url, { shouldValidate: true });
                  }}
                  error={errors.main_image?.message}
                />
              </div>

              <div className="mt-6">
                <Label>תיאור מלא</Label>
                <textarea
                  {...register("full_description")}
                  placeholder="תיאור הטיול"
                  className="mt-1 min-h-[140px] w-full resize-none rounded-lg border p-4 text-sm"
                />
                {errors.full_description && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.full_description.message}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <Label>תגיות</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setValue(
                          "tags",
                          selectedTags.includes(tag)
                            ? selectedTags.filter((t) => t !== tag)
                            : [...selectedTags, tag]
                        )
                      }
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? "border-[#111827] bg-[#111827] text-white"
                          : "border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {errors.tags && (
                  <p className="mt-1 text-sm text-destructive">{errors.tags.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#111827]">תחנות המסלול</h2>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 font-medium text-white transition-colors hover:bg-[#1f2937]"
                >
                  <Plus className="h-4 w-4" />
                  הוספת תחנה
                </button>
              </div>

              {normalizedStations.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-[#e5e7eb] py-12 text-center">
                  <MapPin className="mx-auto mb-3 h-12 w-12 text-[#6b7280]" />
                  <p className="mb-4 text-[#6b7280]">עדיין אין תחנות במסלול</p>
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="rounded-lg bg-[#111827] px-6 py-3 font-medium text-white transition-colors hover:bg-[#1f2937]"
                    >
                      הוספת תחנות
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveDraftAndNavigate("place")}
                        className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                      >
                        + יצירת מקום חדש
                      </button>
                      <button
                        type="button"
                        onClick={() => saveDraftAndNavigate("trail")}
                        className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6]"
                      >
                        + יצירת מסלול חדש
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <BuildStationList
                  stations={normalizedStations}
                  places={places}
                  trails={trails}
                  segmentDistances={segmentDistances}
                  onChange={setStations}
                />
              )}
            </div>

            <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
              <h2 className="mb-4 text-xl font-bold text-[#111827]">מפת המסלול</h2>
              <TripDetailMap markers={mapMarkers} variant="embedded" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="sticky top-24 rounded-lg border border-[#e5e7eb] bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-[#111827]">פעולות</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!tripName.trim()) {
                      toast({ title: "יש להזין שם לטיול לתצוגה מקדימה", variant: "destructive" });
                      return;
                    }
                    setPreviewOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d1d5db] bg-[#f3f4f6] py-3 font-bold text-[#111827] transition-colors hover:bg-[#e5e7eb]"
                >
                  <Eye className="h-4 w-4" />
                  תצוגה מקדימה
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit((d) => onSave(d, "draft"))}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#111827] py-3 font-bold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  שמירה אצלי
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmit((d) => onSave(d, "pending"))}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#111827] py-3 font-bold text-[#111827] transition-colors hover:bg-[#f9fafb] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  שליחה לאישור
                </button>
              </div>

              <div className="mt-6 border-t border-[#e5e7eb] pt-6">
                <h4 className="mb-3 text-sm font-bold text-[#6b7280]">טיפים</h4>
                <ul className="space-y-2 text-sm text-[#6b7280]">
                  <li>• השתמש בחצים למעלה/למטה לשינוי סדר</li>
                  <li>• בחירת אופן הגעה בין תחנות (רכב / הליכה / אופניים)</li>
                  <li>• הזמן הכולל כולל שהייה בתחנות + מעבר ביניהן</li>
                  <li>• שמירה לעיתים קרובות</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateAssistantPanel
        entity="trip"
        getSnapshot={() => ({
          ...getValues(),
          station_count: normalizedStations.length,
        })}
        setValue={setValue}
      />

      <StationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addStation}
        excludedIds={excludedIds}
        anchor={pickerAnchor}
        variant="grid"
        onCreatePlace={() => saveDraftAndNavigate("place")}
        onCreateTrail={() => saveDraftAndNavigate("trail")}
      />

      <BuildTripPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        name={tripName}
        shortDescription={shortDescription}
        fullDescription={fullDescription}
        tags={selectedTags}
        imageUrl={displayImage || DEFAULT_IMAGE}
        stations={normalizedStations}
        places={places}
        trails={trails}
        users={[]}
        stats={stats}
        startTime={startTime}
      />
    </div>
  );
}
