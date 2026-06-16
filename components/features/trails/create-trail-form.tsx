"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Accessibility, Difficulty, Region } from "@/types";
import { DIFFICULTY_LABELS, REGIONS } from "@/types/enums";
import { toast } from "@/components/ui/use-toast";
import { createTrail, TRAIL_TYPE_OPTIONS } from "@/lib/data/trails";
import { trailFormSchema, type TrailFormValues } from "@/lib/validations";
import { CreateTrailPreviewDialog } from "@/components/features/trails/create-trail-preview-dialog";
import { CommonTagsField } from "@/components/features/shared/common-tags-field";
import { CreateFormActions } from "@/components/features/shared/create-form-actions";
import { TripImageField } from "@/components/features/trips/trip-image-field";
import { getAccessibilityLabel } from "@/lib/utils";
import { buildPreviewTrail } from "@/lib/utils/preview-trail";
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

export function CreateTrailForm() {
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
    control,
    formState: { errors },
  } = useForm<TrailFormValues>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      name: "",
      short_description: "",
      full_description: "",
      region: "",
      trail_type: "",
      length_km: 5,
      duration_minutes: 120,
      difficulty: "medium",
      accessibility: 3,
      tags: [],
      estimated_price: 0,
      operating_hours: "",
      start_lat: 32.0853,
      start_lng: 34.7818,
      end_lat: 32.0853,
      end_lng: 34.7818,
      waypoints: [],
      image_url: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "waypoints" });
  const selectedTags = watch("tags") ?? [];
  const imageUrl = watch("image_url") ?? "";

  async function onSubmit(values: TrailFormValues) {
    setSubmitting(true);
    try {
      const trail = await createTrail({
        name: values.name,
        short_description: values.short_description,
        full_description: values.full_description,
        region: values.region as Region,
        trail_type: values.trail_type,
        length_km: values.length_km,
        duration_minutes: values.duration_minutes,
        difficulty: values.difficulty as Difficulty,
        accessibility: values.accessibility as Accessibility,
        tags: values.tags,
        estimated_price: values.estimated_price,
        operating_hours: values.operating_hours,
        start_lat: values.start_lat,
        start_lng: values.start_lng,
        end_lat: values.end_lat,
        end_lng: values.end_lng,
        waypoints: values.waypoints ?? [],
        image_url: values.image_url ?? "",
      });
      toast({ title: "המסלול נשלח לאישור" });
      router.push(`/trails/${trail.id}`);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה ביצירת המסלול",
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

  const previewTrail = buildPreviewTrail(getValues());

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-7xl" dir="rtl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
      <Section title="פרטים בסיסיים">
        <div>
          <Label>שם המסלול</Label>
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

      <Section title="מאפייני המסלול">
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
            <Label>סוג מסלול</Label>
            <select className={inputClass} {...register("trail_type")}>
              <option value="">בחר סוג</option>
              {TRAIL_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <FieldError message={errors.trail_type?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>אורך (ק״מ)</Label>
            <input className={inputClass} type="number" step="0.1" min="0.1" {...register("length_km")} />
            <FieldError message={errors.length_km?.message} />
          </div>
          <div>
            <Label>משך (דקות)</Label>
            <input className={inputClass} type="number" min={15} {...register("duration_minutes")} />
            <FieldError message={errors.duration_minutes?.message} />
          </div>
          <div>
            <Label>קושי</Label>
            <select className={inputClass} {...register("difficulty")}>
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
            <FieldError message={errors.difficulty?.message} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        <div>
          <Label>שעות פעילות</Label>
          <input
            className={inputClass}
            placeholder="למשל: 08:00–17:00"
            {...register("operating_hours")}
          />
        </div>
      </Section>

      <Section title="נקודות על המפה">
        <p className="text-sm text-[#6b7280]">נקודת התחלה וסיום של המסלול</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>התחלה — lat</Label>
            <input className={inputClass} type="number" step="any" {...register("start_lat")} />
            <FieldError message={errors.start_lat?.message} />
          </div>
          <div>
            <Label>התחלה — lng</Label>
            <input className={inputClass} type="number" step="any" {...register("start_lng")} />
            <FieldError message={errors.start_lng?.message} />
          </div>
          <div>
            <Label>סיום — lat</Label>
            <input className={inputClass} type="number" step="any" {...register("end_lat")} />
            <FieldError message={errors.end_lat?.message} />
          </div>
          <div>
            <Label>סיום — lng</Label>
            <input className={inputClass} type="number" step="any" {...register("end_lng")} />
            <FieldError message={errors.end_lng?.message} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>נקודות ביניים (waypoints)</Label>
            <button
              type="button"
              onClick={() => append({ name: "", lat: 32.08, lng: 34.78 })}
              className="flex items-center gap-1 text-sm font-medium text-[#111827] hover:underline"
            >
              <Plus className="h-4 w-4" />
              הוסף נקודה
            </button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-[#9ca3af]">אין נקודות ביניים — אופציונלי</p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded border border-[#e5e7eb] p-3 sm:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <Label>שם (אופציונלי)</Label>
                <input className={inputClass} {...register(`waypoints.${index}.name`)} />
              </div>
              <div>
                <Label>lat</Label>
                <input className={inputClass} type="number" step="any" {...register(`waypoints.${index}.lat`)} />
              </div>
              <div className="flex gap-2">
                <div className="flex-grow">
                  <Label>lng</Label>
                  <input className={inputClass} type="number" step="any" {...register(`waypoints.${index}.lng`)} />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9fafb]"
                  aria-label="הסר נקודה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="תמונה">
        <TripImageField
          label="תמונה של המסלול"
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
        entity="trail"
        getSnapshot={() => getValues() as Record<string, unknown>}
        setValue={setValue}
      />

      <CreateTrailPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        trail={previewTrail}
        saving={submitting}
        onSave={() => void handleSubmit(onSubmit)()}
      />
    </>
  );
}
