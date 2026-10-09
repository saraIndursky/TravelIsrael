import "server-only";

import { getAppBaseUrl } from "@/lib/email/env";
import { sendEmail } from "@/lib/email/send";

const ENTITY_LABELS = {
  place: "מקום",
  trail: "מסלול",
  trip: "טיול",
} as const;

export type ContentEntityType = keyof typeof ENTITY_LABELS;

export function getEntityDetailPath(entityType: ContentEntityType, entityId: string): string {
  switch (entityType) {
    case "place":
      return `/places/${entityId}`;
    case "trail":
      return `/trails/${entityId}`;
    case "trip":
      return `/trips/${entityId}`;
  }
}

export async function sendContentStatusEmail(input: {
  to: string;
  ownerName: string;
  entityType: ContentEntityType;
  entityName: string;
  status: "approved" | "rejected";
  rejectionReason?: string | null;
  entityPath: string;
}): Promise<boolean> {
  const label = ENTITY_LABELS[input.entityType];
  const isApproved = input.status === "approved";
  const subject = isApproved ? `${label} "${input.entityName}" אושר` : `${label} "${input.entityName}" נדחה`;
  const link = `${getAppBaseUrl()}${input.entityPath}`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>שלום ${escapeHtml(input.ownerName)},</p>
      <p>
        ${
          isApproved
            ? `ה${label} <strong>${escapeHtml(input.entityName)}</strong> אושר ומוצג כעת באתר.`
            : `ה${label} <strong>${escapeHtml(input.entityName)}</strong> נדחה ודורש עריכה לפני שליחה מחדש.`
        }
      </p>
      ${
        !isApproved && input.rejectionReason
          ? `<p><strong>סיבת הדחייה:</strong> ${escapeHtml(input.rejectionReason)}</p>`
          : ""
      }
      <p><a href="${link}">לצפייה ב${label}</a></p>
      <p style="color:#6b7280;font-size:14px;">TravelIsrael</p>
    </div>
  `;

  return sendEmail({ to: input.to, subject, html });
}

export async function sendContentRemovedEmail(input: {
  to: string;
  ownerName: string;
  entityType: ContentEntityType;
  entityName: string;
  removalReason?: string | null;
  entityPath: string;
}): Promise<boolean> {
  const label = ENTITY_LABELS[input.entityType];
  const subject = `${label} "${input.entityName}" הוסר מהאתר`;
  const link = `${getAppBaseUrl()}${input.entityPath}`;

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>שלום ${escapeHtml(input.ownerName)},</p>
      <p>
        ה${label} <strong>${escapeHtml(input.entityName)}</strong> הוסר מהאתר ולא מוצג עוד לציבור.
        ניתן לשלוח אותו שוב לאישור מהפרופיל שלך.
      </p>
      ${
        input.removalReason
          ? `<p><strong>סיבת ההסרה:</strong> ${escapeHtml(input.removalReason)}</p>`
          : ""
      }
      <p><a href="${link}">לצפייה ב${label}</a></p>
      <p style="color:#6b7280;font-size:14px;">TravelIsrael</p>
    </div>
  `;

  return sendEmail({ to: input.to, subject, html });
}

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
}): Promise<boolean> {
  const link = `${getAppBaseUrl()}/wizard`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>שלום ${escapeHtml(input.name)},</p>
      <p>ברוכים הבאים ל-TravelIsrael! אפשר להתחיל לגלות טיולים, לשמור מועדפים ולבנות מסלול משלך.</p>
      <p><a href="${link}">התחילו באשף ההתאמה</a></p>
      <p style="color:#6b7280;font-size:14px;">TravelIsrael</p>
    </div>
  `;

  return sendEmail({
    to: input.to,
    subject: "ברוכים הבאים ל-TravelIsrael",
    html,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
