import { z } from "zod";

export const tripFormSchema = z.object({
  name: z.string().min(2, "שם הטיול חייב להכיל לפחות 2 תווים"),
  short_description: z.string().min(10, "תיאור קצר חייב להכיל לפחות 10 תווים"),
  full_description: z.string().min(20, "תיאור מלא חייב להכיל לפחות 20 תווים"),
  tags: z.array(z.string()).min(1, "יש לבחור לפחות תגית אחת"),
  main_image: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) =>
        !val ||
        val.startsWith("data:image/") ||
        z.string().url().safeParse(val).success,
      { message: "יש להזין כתובת תמונה תקינה" }
    ),
});

export const wizardSchema = z.object({
  region: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  accessibility: z.number().min(1).max(5).optional(),
  tripType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  specialPreferences: z.array(z.string()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(3, "התגובה חייבת להכיל לפחות 3 תווים").max(500),
});

export const reportSchema = z.object({
  reason: z.string().min(5, "יש לפרט את סיבת הדיווח"),
});

export const loginSchema = z.object({
  email: z.string().email("יש להזין כתובת אימייל תקינה"),
  password: z.string().min(1, "יש להזין סיסמה"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "שם פרטי חייב להכיל לפחות 2 תווים"),
    lastName: z.string().min(2, "שם משפחה חייב להכיל לפחות 2 תווים"),
    email: z.string().email("יש להזין כתובת אימייל תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string().min(1, "יש לאמת את הסיסמה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

const imageUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .refine(
    (val) =>
      !val ||
      val.startsWith("data:image/") ||
      z.string().url().safeParse(val).success,
    { message: "יש להזין כתובת תמונה תקינה" }
  );

export const placeFormSchema = z.object({
  name: z.string().min(2, "שם המקום חייב להכיל לפחות 2 תווים"),
  short_description: z.string().min(10, "תיאור קצר חייב להכיל לפחות 10 תווים"),
  full_description: z.string().min(20, "תיאור מלא חייב להכיל לפחות 20 תווים"),
  address: z.string().min(2, "יש להזין כתובת"),
  lat: z.coerce.number().min(-90).max(90, "קו רוחב לא תקין"),
  lng: z.coerce.number().min(-180).max(180, "קו אורך לא תקין"),
  region: z.string().min(1, "יש לבחור אזור"),
  place_type: z.string().min(1, "יש לבחור סוג מקום"),
  accessibility: z.coerce.number().min(1).max(5),
  tags: z.array(z.string()).min(1, "יש לבחור לפחות תגית אחת"),
  avg_duration_minutes: z.coerce.number().min(15, "משך מינימלי 15 דקות"),
  estimated_price: z.coerce.number().min(0),
  opening_time: z.string().optional().or(z.literal("")),
  closing_time: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "כתובת אתר לא תקינה",
    }),
  image_url: imageUrlSchema,
});

const waypointSchema = z.object({
  name: z.string().optional().or(z.literal("")),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export const trailFormSchema = z.object({
  name: z.string().min(2, "שם המסלול חייב להכיל לפחות 2 תווים"),
  short_description: z.string().min(10, "תיאור קצר חייב להכיל לפחות 10 תווים"),
  full_description: z.string().min(20, "תיאור מלא חייב להכיל לפחות 20 תווים"),
  region: z.string().min(1, "יש לבחור אזור"),
  trail_type: z.string().min(1, "יש לבחור סוג מסלול"),
  length_km: z.coerce.number().min(0.1, "אורך המסלול חייב להיות חיובי"),
  duration_minutes: z.coerce.number().min(15, "משך מינימלי 15 דקות"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  accessibility: z.coerce.number().min(1).max(5),
  tags: z.array(z.string()).min(1, "יש לבחור לפחות תגית אחת"),
  estimated_price: z.coerce.number().min(0),
  operating_hours: z.string().optional().or(z.literal("")),
  start_lat: z.coerce.number().min(-90).max(90),
  start_lng: z.coerce.number().min(-180).max(180),
  end_lat: z.coerce.number().min(-90).max(90),
  end_lng: z.coerce.number().min(-180).max(180),
  waypoints: z.array(waypointSchema).default([]),
  image_url: imageUrlSchema,
});

export type TripFormValues = z.infer<typeof tripFormSchema>;
export type PlaceFormValues = z.infer<typeof placeFormSchema>;
export type TrailFormValues = z.infer<typeof trailFormSchema>;
export type WizardFormValues = z.infer<typeof wizardSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
