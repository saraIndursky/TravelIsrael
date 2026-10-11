import { z } from "zod";

export const CONTACT_LIMITS = {
  nameMax: 80,
  emailMax: 200,
  subjectMax: 120,
  messageMin: 10,
  messageMax: 2000,
} as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "נא להזין שם")
    .max(CONTACT_LIMITS.nameMax, "השם ארוך מדי"),
  email: z
    .string()
    .trim()
    .email("כתובת האימייל לא תקינה")
    .max(CONTACT_LIMITS.emailMax, "כתובת האימייל ארוכה מדי"),
  subject: z
    .string()
    .trim()
    .min(3, "נא להזין נושא")
    .max(CONTACT_LIMITS.subjectMax, "הנושא ארוך מדי"),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.messageMin, `ההודעה קצרה מדי (לפחות ${CONTACT_LIMITS.messageMin} תווים)`)
    .max(CONTACT_LIMITS.messageMax, `ההודעה ארוכה מדי (עד ${CONTACT_LIMITS.messageMax} תווים)`),
  /** Honeypot: real visitors never see or fill this field, bots usually do. */
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
