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

export type TripFormValues = z.infer<typeof tripFormSchema>;
export type WizardFormValues = z.infer<typeof wizardSchema>;
