"use client";

import { useEffect, useId, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { User, UserRole } from "@/types";

/** Thrown when the admin closes the dialog without confirming; the list ignores it silently. */
export class RoleChangeCancelled extends Error {
  constructor() {
    super("השינוי בוטל");
    this.name = "RoleChangeCancelled";
  }
}

interface RoleChangeDialogProps {
  open: boolean;
  user: User | null;
  newRole: UserRole | null;
  /** False for admins who signed in with Google: there is no password to type. */
  needsPassword: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
}

/**
 * Confirmation step before a role changes. The admin states the change again and re-enters their
 * own password; the database additionally refuses role changes unless the session was
 * authenticated in the last few minutes, so this can't be skipped from the browser.
 */
export function RoleChangeDialog({ open, user, newRole, needsPassword, onCancel, onConfirm }: RoleChangeDialogProps) {
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!user || !newRole) return null;
  const promoting = newRole === "admin";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (needsPassword && !password) {
      setError("יש להזין את הסיסמה שלך");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "הפעולה נכשלה");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onCancel()}>
      <DialogContent className="max-w-md bg-white text-[#111827]">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-6 w-6 text-amber-700" aria-hidden />
            </div>
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle>{promoting ? "מינוי מנהל" : "הסרת הרשאות מנהל"}</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-700">
                {promoting
                  ? `להפוך את ${user.name} למנהל? מנהל יכול לאשר ולמחוק תוכן, לטפל בדיווחים, ולנהל משתמשים ותפקידים.`
                  : `להסיר את הרשאות המנהל של ${user.name} ולהחזיר אותו למשתמש רגיל?`}
              </p>
            </div>
          </div>

          {needsPassword ? (
            <div>
              <label htmlFor={passwordId} className="mb-1 block text-sm font-medium text-gray-700">
                הסיסמה שלך, לאישור הפעולה
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ti-input w-full"
                autoFocus
              />
            </div>
          ) : (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              נכנסת עם חשבון Google ולכן אין סיסמה להזין. אם תוצג הודעה שנדרש אימות מחדש, התנתקו והתחברו שוב ונסו שנית.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "מאמת..." : promoting ? "אישור מינוי" : "אישור הסרה"}
            </Button>
            <Button type="button" variant="outline" disabled={submitting} onClick={onCancel} className="flex-1">
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
