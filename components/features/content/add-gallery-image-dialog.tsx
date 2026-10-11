"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Link2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { uploadContentImageWithPath } from "@/lib/data/content-images";
import { toast } from "@/components/ui/use-toast";

export interface GalleryImagePayload {
  url: string;
  storagePath: string;
}

interface AddGalleryImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (payload: GalleryImagePayload) => Promise<void>;
}

export function AddGalleryImageDialog({ open, onOpenChange, onAdd }: AddGalleryImageDialogProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [adding, setAdding] = useState(false);

  const reset = useCallback(() => {
    setImageUrl("");
    setPreviewUrl((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return "";
    });
    setFile(null);
    setDragOver(false);
  }, []);

  const handleFile = useCallback((next: File) => {
    if (!next.type.startsWith("image/")) return;
    setFile(next);
    setImageUrl("");
    setPreviewUrl((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return URL.createObjectURL(next);
    });
  }, []);

  const handleSubmit = async () => {
    setAdding(true);
    try {
      let payload: GalleryImagePayload;
      if (file) {
        payload = await uploadContentImageWithPath(file);
      } else {
        const url = imageUrl.trim();
        if (!url) return;
        payload = { url, storagePath: "" };
      }
      await onAdd(payload);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "הוספת התמונה נכשלה",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const canSubmit = Boolean(file) || Boolean(imageUrl.trim());

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="bg-white text-[#111827] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוספת תמונה לגלריה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm text-[#6b7280]">
              <Link2 className="h-4 w-4" />
              קישור לתמונה
            </p>
            <input
              type="url"
              value={file ? "" : imageUrl}
              onChange={(e) => {
                setFile(null);
                setImageUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="הדביקי קישור לתמונה (URL)"
              className="w-full rounded-sm border border-[#d1d5db] bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
            />
          </div>

          <div className="text-center text-xs text-[#6b7280]">או</div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const dropped = e.dataTransfer.files[0];
              if (dropped) handleFile(dropped);
            }}
            className={`flex flex-col items-center justify-center rounded-sm border-2 border-dashed px-4 py-8 transition-colors ${
              dragOver ? "border-[#111827] bg-[#f9fafb]" : "border-[#d1d5db] bg-[#fafafa]"
            }`}
          >
            <Upload className="mb-2 h-8 w-8 text-[#6b7280]" />
            <p className="mb-1 text-sm text-[#4b5563]">גררי תמונה לכאן</p>
            <p className="mb-3 text-xs text-[#6b7280]">או</p>
            <label className="cursor-pointer rounded-sm border border-[#111827] px-4 py-2 text-sm font-medium text-[#111827] transition-colors hover:bg-[#f9fafb]">
              בחרי קובץ
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFile(selected);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="mt-2 text-xs text-[#6b7280]">עד 5MB · JPG / PNG / WEBP / GIF</p>
          </div>

          {previewUrl && (
            <div className="relative mx-auto h-32 w-full max-w-xs overflow-hidden rounded-sm border border-[#e5e7eb]">
              <Image src={previewUrl} alt="תצוגה מקדימה" fill className="object-cover" unoptimized />
            </div>
          )}

          <button
            type="button"
            disabled={adding || !canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-sm bg-[#111827] py-2.5 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-60"
          >
            {adding ? "שומר..." : "שמור"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
