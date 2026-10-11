"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { Accessibility, Difficulty, Region, Trail } from "@/types";
import { DIFFICULTY_LABELS } from "@/types/enums";
import { toast } from "@/components/ui/use-toast";
import { createTrail, updateTrail, getApprovedTrailTypes } from "@/lib/data/trails";
import { ensureRegion } from "@/lib/data/regions";
import { trailTypes } from "@/lib/utils/trail-types";
import { CustomTypeField } from "@/components/features/shared/custom-type-field";
import { RegionField } from "@/components/features/shared/region-field";
import { trailPath } from "@/lib/utils/content-path";
import { trailFormSchema, type TrailFormValues } from "@/lib/validations";
import { CreateTrailPreviewDialog } from "@/components/features/trails/create-trail-preview-dialog";
import { CommonTagsField } from "@/components/features/shared/common-tags-field";
import { CreateFormActions } from "@/components/features/shared/create-form-actions";
import { TripImageField } from "@/components/features/trips/trip-image-field";
import { getAccessibilityLabel } from "@/lib/utils";
import { buildPreviewTrail } from "@/lib/utils/preview-trail";
import { CreateAssistantPanel } from "@/components/features/assistant/create-assistant-panel";
import { useAuthStore } from "@/hooks/use-stores";
import {
  buildTripReturnUrl,
  sanitizeReturnPath,
} from "@/lib/utils/trip-create-draft";

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

const emptyValues: TrailFormValues = {
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
};

function toFormValues(trail: Trail): TrailFormValues {
  return {
    name: trail.name,
    short_description: trail.short_description,
    full_description: trail.full_description,
    region: trail.region,
    trail_type: trail.trail_type,
    length_km: trail.length_km,
    duration_minutes: trail.duration_minutes,
    difficulty: trail.difficulty,
    accessibility: trail.accessibility,
    tags: trail.tags,
    estimated_price: trail.estimated_price,
    operating_hours: trail.operating_hours ?? "",
    start_lat: trail.start_lat,
    start_lng: trail.start_lng,
    end_lat: trail.end_lat,
    end_lng: trail.end_lng,
    waypoints: trail.waypoints.map((w) => ({
      name: w.name ?? "",
      lat: w.lat,
      lng: w.lng,
    })),
    image_url: trail.image_url,
  };
}

interface TrailFormProps {
  mode?: "create" | "edit";
  trailId?: string;
  initialTrail?: Trail;
}

export function TrailForm({ mode = "create", trailId, initialTrail }: TrailFormProps) {
  const router = useRouter();
  const { role } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [newRegionParent, setNewRegionParent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEdit = mode === "edit";
  const keepsStatus = isEdit && role === "admin";
  const saveLabel = keepsStatus ? "שמור שינויים" : "שמור ושלח לאישור";

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
    defaultValues: initialTrail ? toFormValues(initialTrail) : emptyValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "waypoints" });
  const selectedTags = watch("tags") ?? [];
  const imageUrl = watch("image_url") ?? "";

  async function onSubmit(values: TrailFormValues) {
    setSubmitting(true);
    try {
      const region = await ensureRegion(values.region, newRegionParent);
      const payload = {
        name: values.name,
        short_description: values.short_description,
        full_description: values.full_description,
        region: region as Region,
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
      };

      if (isEdit && trailId) {
        const updated = await updateTrail(trailId, payload);
        if (!updated) {
          toast({ title: "אין הרשאה לערוך מסלול זה", variant: "destructive" });
          return;
        }
        toast({ title: keepsStatus ? "השינויים נשמרו" : "המסלול עודכן ונשלח לאישור" });
        router.push(trailPath(updated));
        return;
      }

      const trail = await createTrail(payload);
      toast({ title: "המסלול נשלח לאישור" });
      const returnTo = sanitizeReturnPath(
        new URLSearchParams(window.location.search).get("returnTo")
      );
      if (returnTo) {
        router.push(buildTripReturnUrl(returnTo, { type: "trail", id: trail.id }));
      } else {
        router.push(trailPath(trail));
      }
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : isEdit
              ? "שגיאה בעדכון המסלול"
              : "שגיאה ביצירת המסלול",
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

  const previewTrail = buildPreviewTrail(getValues(), initialTrail);

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
          <RegionField
            value={watch("region") ?? ""}
            onChange={(region) => setValue("region", region, { shouldValidate: true })}
            parentId={newRegionParent}
            onParentChange={setNewRegionParent}
            error={errors.region?.message}
          />
          <CustomTypeField
            label="סוג מסלול"
            helpers={trailTypes}
            loadApprovedTypes={getApprovedTrailTypes}
            value={watch("trail_type") ?? ""}
            onChange={(type) => setValue("trail_type", type, { shouldValidate: true })}
            error={errors.trail_type?.message}
            newTypePlaceholder="למשל: רכיבה על סוסים"
            newTypeHint="לא מצאת סוג מתאים? כתבי אותו כאן. אחרי שהמנהל יאשר את המסלול, הסוג יתווסף לרשימה לכולם."
          />
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
            <CreateFormActions
              onPreview={() => void openPreview()}
              submitting={submitting}
              saveLabel={saveLabel}
            />
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
        saveLabel={saveLabel}
        onSave={() => void handleSubmit(onSubmit)()}
      />
    </>
  );
}
