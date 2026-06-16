"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { REGIONS } from "@/types/enums";
import type { Accessibility, Region } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { createPlace, PLACE_TYPE_OPTIONS } from "@/lib/data/places";
import { placeFormSchema, type PlaceFormValues } from "@/lib/validations";
import { CreatePlacePreviewDialog } from "@/components/features/places/create-place-preview-dialog";
import { CommonTagsField } from "@/components/features/shared/common-tags-field";
import { CreateFormActions } from "@/components/features/shared/create-form-actions";
import { TripImageField } from "@/components/features/trips/trip-image-field";
import { getAccessibilityLabel } from "@/lib/utils";
import { buildPreviewPlace } from "@/lib/utils/preview-place";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";

const inputClass =
  "w-full rounded-sm border border-[#d1d5db] bg-white px-4 py-2.5 text-sm text-[#111827] focus:border-[#111827] focus:outline-none";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-[#111827]">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

export function CreatePlaceForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: "",
      short_description: "",
      full_description: "",
      address: "",
      lat: 32.0853,
      lng: 34.7818,
      region: "",
      place_type: "",
      accessibility: 3,
      tags: [],
      avg_duration_minutes: 60,
      estimated_price: 0,
      opening_time: "",
      closing_time: "",
      phone: "",
      website: "",
      image_url: "",
    },
  });

  const selectedTags = watch("tags") ?? [];
  const imageUrl = watch("image_url") ?? "";

  async function onSubmit(values: PlaceFormValues) {
    setSubmitting(true);
    try {
      const place = await createPlace({
        name: values.name,
        short_description: values.short_description,
        full_description: values.full_description,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        region: values.region as Region,
        place_type: values.place_type,
        accessibility: values.accessibility as Accessibility,
        tags: values.tags,
        avg_duration_minutes: values.avg_duration_minutes,
        estimated_price: values.estimated_price,
        opening_time: values.opening_time,
        closing_time: values.closing_time,
        phone: values.phone,
        website: values.website,
        image_url: values.image_url ?? "",
      });
      toast({ title: "המקום נשלח לאישור" });
      router.push(`/places/${place.id}`);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה ביצירת המקום",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function openPreview() {
    const valid = await trigger();
    if (!valid) {
      toast({ title: "יש לתקן שגיאות בטופס לפני תצוגה מקדימה", variant: "destructive" });
      return;
    }
    setPreviewOpen(true);
  }

  const previewPlace = buildPreviewPlace(getValues());

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-7xl" dir="rtl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
      <Section title="פרטים בסיסיים">
        <div>
          <Label>שם המקום</Label>
          <input className={inputClass} {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label>תיאור קצר</Label>
          <textarea className={inputClass} rows={2} {...register("short_description")} />
          <FieldError message={errors.short_description?.message} />
        </div>
        <div>
          <Label>תיאור מלא</Label>
          <textarea className={inputClass} rows={5} {...register("full_description")} />
          <FieldError message={errors.full_description?.message} />
        </div>
        <CommonTagsField
          selected={selectedTags}
          onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
          error={errors.tags?.message}
        />
      </Section>

      <Section title="מיקום וסוג">
        <div>
          <Label>כתובת</Label>
          <input className={inputClass} {...register("address")} />
          <FieldError message={errors.address?.message} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>אזור</Label>
            <select className={inputClass} {...register("region")}>
              <option value="">בחר אזור</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <FieldError message={errors.region?.message} />
          </div>
          <div>
            <Label>סוג מקום</Label>
            <select className={inputClass} {...register("place_type")}>
              <option value="">בחר סוג</option>
              {PLACE_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <FieldError message={errors.place_type?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>קו רוחב (lat)</Label>
            <input className={inputClass} type="number" step="any" {...register("lat")} />
            <FieldError message={errors.lat?.message} />
          </div>
          <div>
            <Label>קו אורך (lng)</Label>
            <input className={inputClass} type="number" step="any" {...register("lng")} />
            <FieldError message={errors.lng?.message} />
          </div>
        </div>
      </Section>

      <Section title="מידע למבקרים">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>משך ביקור (דקות)</Label>
            <input className={inputClass} type="number" min={15} {...register("avg_duration_minutes")} />
            <FieldError message={errors.avg_duration_minutes?.message} />
          </div>
          <div>
            <Label>מחיר משוער (₪)</Label>
            <input className={inputClass} type="number" min={0} {...register("estimated_price")} />
            <FieldError message={errors.estimated_price?.message} />
          </div>
          <div>
            <Label>נגישות (1–5)</Label>
            <select className={inputClass} {...register("accessibility")}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} — {getAccessibilityLabel(n)}
                </option>
              ))}
            </select>
            <FieldError message={errors.accessibility?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>שעת פתיחה</Label>
            <input className={inputClass} type="time" {...register("opening_time")} />
          </div>
          <div>
            <Label>שעת סגירה</Label>
            <input className={inputClass} type="time" {...register("closing_time")} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>טלפון</Label>
            <input className={inputClass} type="tel" {...register("phone")} />
          </div>
          <div>
            <Label>אתר אינטרנט</Label>
            <input className={inputClass} type="url" placeholder="https://..." {...register("website")} />
            <FieldError message={errors.website?.message} />
          </div>
        </div>
      </Section>

      <Section title="תמונה">
        <TripImageField
          label="תמונה של המקום"
          value={imageUrl}
          onChange={(url) => setValue("image_url", url, { shouldValidate: true })}
          error={errors.image_url?.message}
        />
      </Section>
          </div>

          <div>
            <CreateFormActions onPreview={() => void openPreview()} submitting={submitting} />
          </div>
        </div>
      </form>

      <CreateAssistantPanel
        entity="place"
        getSnapshot={() => getValues() as Record<string, unknown>}
        setValue={setValue}
      />

      <CreatePlacePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        place={previewPlace}
        saving={submitting}
        onSave={() => void handleSubmit(onSubmit)()}
      />
    </>
  );
}
