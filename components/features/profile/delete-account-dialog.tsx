"use client";

import { useEffect, useId, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteAccountDialogProps {
  open: boolean;
  /** False for users who signed in with Google: there is no password to type. */
  needsPassword: boolean;
  onCancel: () => void;
  onConfirm: (password: string) => Promise<void>;
}

/** Final confirmation before an account is deleted; the user re-enters their password. */
export function DeleteAccountDialog({ open, needsPassword, onCancel, onConfirm }: DeleteAccountDialogProps) {
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
      setError(err instanceof Error ? err.message : "מחיקת החשבון נכשלה");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onCancel()}>
      <DialogContent className="max-w-md bg-white text-[#111827]">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
              <TriangleAlert className="h-6 w-6 text-red-700" aria-hidden />
            </div>
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle>מחיקת החשבון</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-700">
                החשבון יימחק לצמיתות ואי אפשר יהיה לשחזר אותו. הטיולים, המקומות והמסלולים שכבר פורסמו יישארו באתר
                תחת שם האתר. טיוטות, תוכן שממתין לאישור, תגובות, דירוגים ומועדפים יימחקו.
              </p>
            </div>
          </div>

          {needsPassword ? (
            <div>
              <label htmlFor={passwordId} className="mb-1 block text-sm font-medium text-gray-700">
                הסיסמה שלך, לאישור המחיקה
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
            <Button type="submit" variant="danger" disabled={submitting} className="flex-1">
              {submitting ? "מוחק..." : "מחיקת החשבון"}
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
