"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  description: string;
  confirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title = "אישור מחיקה",
  description,
  confirming = false,
  onConfirm,
  onClose,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !confirming && onClose()}>
      <DialogContent className="max-w-md bg-white text-[#111827]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
          </div>
          <div className="space-y-2">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="danger"
            className="flex-1 rounded-xl"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? "מוחק..." : "מחיקה"}
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" disabled={confirming} onClick={onClose}>
            ביטול
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
