"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import type { Accessibility, Place, Region } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { createPlace, updatePlace, getApprovedPlaceTypes } from "@/lib/data/places";
import { placeTypes } from "@/lib/utils/place-types";
import { ensureRegion } from "@/lib/data/regions";
import { CustomTypeField } from "@/components/features/shared/custom-type-field";
import { RegionField } from "@/components/features/shared/region-field";
import { placePath } from "@/lib/utils/content-path";
import { placeFormSchema, type PlaceFormValues } from "@/lib/validations";
import { CreatePlacePreviewDialog } from "@/components/features/places/create-place-preview-dialog";
import { CommonTagsField } from "@/components/features/shared/common-tags-field";
import { CreateFormActions } from "@/components/features/shared/create-form-actions";
import { TripImageField } from "@/components/features/trips/trip-image-field";
import { getAccessibilityLabel } from "@/lib/utils";
import { buildPreviewPlace } from "@/lib/utils/preview-place";
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

const emptyValues: PlaceFormValues = {
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
};

function toFormValues(place: Place): PlaceFormValues {
  return {
    name: place.name,
    short_description: place.short_description,
    full_description: place.full_description,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    region: place.region,
    place_type: place.place_type,
    accessibility: place.accessibility,
    tags: place.tags,
    avg_duration_minutes: place.avg_duration_minutes,
    estimated_price: place.estimated_price,
    opening_time: place.opening_time ?? "",
    closing_time: place.closing_time ?? "",
    phone: place.phone ?? "",
    website: place.website ?? "",
    image_url: place.image_url,
  };
}

interface PlaceFormProps {
  mode?: "create" | "edit";
  placeId?: string;
  initialPlace?: Place;
}

export function PlaceForm({ mode = "create", placeId, initialPlace }: PlaceFormProps) {
  const router = useRouter();
  const { role } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isEdit = mode === "edit";
  const keepsStatus = isEdit && role === "admin";
  const saveLabel = keepsStatus ? "שמירת שינויים" : "שמירה ושליחה לאישור";

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
    defaultValues: initialPlace ? toFormValues(initialPlace) : emptyValues,
  });

  const selectedTags = watch("tags") ?? [];
  const imageUrl = watch("image_url") ?? "";

  const [newRegionParent, setNewRegionParent] = useState("");

  async function onSubmit(values: PlaceFormValues) {
    setSubmitting(true);
    try {
      const region = await ensureRegion(values.region, newRegionParent);
      const payload = {
        name: values.name,
        short_description: values.short_description,
        full_description: values.full_description,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        region: region as Region,
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
      };

      if (isEdit && placeId) {
        const updated = await updatePlace(placeId, payload);
        if (!updated) {
          toast({ title: "אין הרשאה לערוך מקום זה", variant: "destructive" });
          return;
        }
        toast({ title: keepsStatus ? "השינויים נשמרו" : "המקום עודכן ונשליחה לאישור" });
        window.location.assign(placePath(updated));
        return;
      }

      const place = await createPlace(payload);
      toast({ title: "המקום נשליחה לאישור" });
      const returnTo = sanitizeReturnPath(
        new URLSearchParams(window.location.search).get("returnTo")
      );
      if (returnTo) {
        router.push(buildTripReturnUrl(returnTo, { type: "place", id: place.id }));
      } else {
        router.push(placePath(place));
      }
    } catch (error) {
      toast({
        title:
          error instanceof Error
            ? error.message
            : isEdit
              ? "שגיאה בעדכון המקום"
              : "שגיאה ביצירת המקום",
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

  const previewPlace = buildPreviewPlace(getValues(), initialPlace);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-7xl" dir="rtl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
      <Section title="פרטים בסיסיים">
        <div>
          <Label htmlFor="place-name">שם המקום</Label>
          <input className={inputClass} id="place-name" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="place-short-description">תיאור קצר</Label>
          <textarea className={inputClass} rows={2} id="place-short-description" {...register("short_description")} />
          <FieldError message={errors.short_description?.message} />
        </div>
        <div>
          <Label htmlFor="place-full-description">תיאור מלא</Label>
          <textarea className={inputClass} rows={5} id="place-full-description" {...register("full_description")} />
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
          <Label htmlFor="place-address">כתובת</Label>
          <input className={inputClass} id="place-address" {...register("address")} />
          <FieldError message={errors.address?.message} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <RegionField
            value={watch("region") ?? ""}
            onChange={(region) => setValue("region", region, { shouldValidate: true })}
            parentId={newRegionParent}
            onParentChange={setNewRegionParent}
            error={errors.region?.message}
          />
          <CustomTypeField
            label="סוג מקום"
            helpers={placeTypes}
            loadApprovedTypes={getApprovedPlaceTypes}
            value={watch("place_type") ?? ""}
            onChange={(type) => setValue("place_type", type, { shouldValidate: true })}
            error={errors.place_type?.message}
            newTypePlaceholder="למשל: מעיין"
            newTypeHint="לא מצאתם סוג מתאים? כתבו אותו כאן. אחרי שהמנהל יאשר את המקום, הסוג יתווסף לרשימה לכולם."
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="place-lat">קו רוחב (lat)</Label>
            <input className={inputClass} type="number" step="any" id="place-lat" {...register("lat")} />
            <FieldError message={errors.lat?.message} />
          </div>
          <div>
            <Label htmlFor="place-lng">קו אורך (lng)</Label>
            <input className={inputClass} type="number" step="any" id="place-lng" {...register("lng")} />
            <FieldError message={errors.lng?.message} />
          </div>
        </div>
      </Section>

      <Section title="מידע למבקרים">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="place-avg-duration-minutes">משך ביקור (דקות)</Label>
            <input className={inputClass} type="number" min={15} id="place-avg-duration-minutes" {...register("avg_duration_minutes")} />
            <FieldError message={errors.avg_duration_minutes?.message} />
          </div>
          <div>
            <Label htmlFor="place-estimated-price">מחיר משוער (₪)</Label>
            <input className={inputClass} type="number" min={0} id="place-estimated-price" {...register("estimated_price")} />
            <FieldError message={errors.estimated_price?.message} />
          </div>
          <div>
            <Label htmlFor="place-accessibility">נגישות (1–5)</Label>
            <select className={inputClass} id="place-accessibility" {...register("accessibility")}>
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
            <Label htmlFor="place-opening-time">שעת פתיחה</Label>
            <input className={inputClass} type="time" id="place-opening-time" {...register("opening_time")} />
          </div>
          <div>
            <Label htmlFor="place-closing-time">שעת סגירה</Label>
            <input className={inputClass} type="time" id="place-closing-time" {...register("closing_time")} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="place-phone">טלפון</Label>
            <input className={inputClass} type="tel" id="place-phone" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="place-website">אתר אינטרנט</Label>
            <input className={inputClass} type="url" placeholder="https://..." id="place-website" {...register("website")} />
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
            <CreateFormActions
              onPreview={() => void openPreview()}
              submitting={submitting}
              saveLabel={saveLabel}
            />
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
        saveLabel={saveLabel}
        onSave={() => void handleSubmit(onSubmit)()}
      />
    </>
  );
}
