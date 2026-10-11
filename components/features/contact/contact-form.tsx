"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { useAuthStore } from "@/hooks/use-stores";
import { CONTACT_LIMITS, contactSchema } from "@/lib/validations/contact";

type FieldName = "name" | "email" | "subject" | "message";

const inputClass =
  "w-full rounded-lg border border-gray-200 p-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-500";

const emptyForm = { name: "", email: "", subject: "", message: "", website: "" };

export function ContactForm() {
  const { userName, userEmail } = useAuthStore();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Signed-in visitors don't have to retype their details.
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || userName,
      email: prev.email || userEmail,
    }));
  }, [userName, userEmail]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as FieldName]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (field && !next[field]) next[field] = issue.message;
      }
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!response.ok || !result?.ok) {
        setServerError(result?.message ?? "לא הצלחנו לשלוח את ההודעה. נסו שוב מאוחר יותר.");
        return;
      }
      setSent(true);
      setForm({ ...emptyForm, name: userName, email: userEmail });
      setErrors({});
    } catch {
      setServerError("אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-12 text-center"
        role="status"
      >
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h3 className="mb-3 text-2xl font-semibold text-gray-900">ההודעה נשלחה בהצלחה!</h3>
        <p className="text-lg text-gray-600">תודה שיצרתם קשר. נחזור אליכם בהקדם האפשרי.</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-lg border border-emerald-300 px-5 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
        >
          שליחת הודעה נוספת
        </button>
      </div>
    );
  }

  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-2 block font-medium text-gray-700">
            שם מלא
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={CONTACT_LIMITS.nameMax}
            className={inputClass}
            placeholder="איך קוראים לך?"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-2 block font-medium text-gray-700">
            אימייל
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            dir="ltr"
            value={form.email}
            onChange={handleChange}
            maxLength={CONTACT_LIMITS.emailMax}
            className={`${inputClass} text-right`}
            placeholder="your@email.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {fieldError("email")}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-2 block font-medium text-gray-700">
          נושא
        </label>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          maxLength={CONTACT_LIMITS.subjectMax}
          className={inputClass}
          placeholder="על מה תרצו לדבר?"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        />
        {fieldError("subject")}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block font-medium text-gray-700">
          הודעה
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={6}
          maxLength={CONTACT_LIMITS.messageMax}
          className={`${inputClass} resize-none`}
          placeholder="כתבו לנו כל מה שבא לכם... אנחנו מקשיבים"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        <div className="mt-1 flex items-start justify-between gap-4">
          <div>{fieldError("message")}</div>
          <span className="text-xs text-gray-500">
            {form.message.length}/{CONTACT_LIMITS.messageMax}
          </span>
        </div>
      </div>

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">אל תמלאו שדה זה</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">טיפ:</span> ככל שתספקו יותר פרטים, כך נוכל לעזור לכם טוב יותר ומהר יותר.
        </p>
      </div>

      {serverError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-800 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-gray-600 hover:to-gray-900 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>שולח...</span>
          </>
        ) : (
          <>
            <span>שליחת הודעה</span>
            <Send className="h-5 w-5 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
