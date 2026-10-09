"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import type { Region } from "@/types";
import type { RegionRecord, RegionTreeNode } from "@/types/region";
import { REGIONS } from "@/types/enums";
import { toast } from "@/components/ui/use-toast";
import { CenteredPageLoading } from "@/components/layout/page-loading";
import {
  buildRegionTree,
  createRegion,
  deleteRegion,
  getRegions,
  updateRegion,
} from "@/lib/data/regions";

interface RegionFormState {
  name: string;
  parent_id: string;
  code: Region | "";
  is_selectable: boolean;
  sort_order: number;
}

const emptyForm: RegionFormState = {
  name: "",
  parent_id: "",
  code: "",
  is_selectable: false,
  sort_order: 0,
};

interface AdminRegionsListPageProps {
  loading?: boolean;
}

export function AdminRegionsListPage({ loading: externalLoading }: AdminRegionsListPageProps) {
  const [regions, setRegions] = useState<RegionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RegionRecord | null>(null);
  const [form, setForm] = useState<RegionFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setRegions(await getRegions());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tree = useMemo(() => buildRegionTree(regions), [regions]);
  const parentOptions = useMemo(
    () => regions.filter((region) => !region.is_selectable),
    [regions]
  );

  const isBusy = loading || externalLoading;

  function openCreate(parentId?: string) {
    setEditing(null);
    setForm({
      ...emptyForm,
      parent_id: parentId ?? "",
      sort_order: regions.filter((region) => region.parent_id === (parentId ?? null)).length + 1,
    });
    setDialogOpen(true);
  }

  function openEdit(region: RegionRecord) {
    setEditing(region);
    setForm({
      name: region.name,
      parent_id: region.parent_id ?? "",
      code: region.code ?? "",
      is_selectable: region.is_selectable,
      sort_order: region.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        parent_id: form.parent_id || null,
        code: form.is_selectable ? (form.code as Region) : null,
        is_selectable: form.is_selectable,
        sort_order: form.sort_order,
      };

      if (editing) {
        await updateRegion(editing.id, payload);
        toast({ title: "האזור עודכן" });
      } else {
        await createRegion(payload);
        toast({ title: "האזור נוצר" });
      }

      setDialogOpen(false);
      await load();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה בשמירת האזור",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(region: RegionRecord) {
    if (!window.confirm(`למחוק את "${region.name}"?`)) return;
    try {
      await deleteRegion(region.id);
      toast({ title: "האזור נמחק" });
      await load();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה במחיקת האזור",
        variant: "destructive",
      });
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function renderNode(node: RegionTreeNode, depth = 0) {
    const record = regions.find((region) => region.id === node.id);
    if (!record) return null;

    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expanded.includes(node.id);

    return (
      <div key={node.id}>
        <div
          className="flex items-center gap-3 border-b border-border/60 bg-white px-4 py-3 md:px-8"
          style={{ paddingInlineStart: `${16 + depth * 24}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(node.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border"
              aria-label={isExpanded ? "סגור" : "פתח"}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground">•</span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{record.name}</span>
              {record.is_selectable && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {record.code}
                </span>
              )}
              {!record.is_selectable && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">קבוצה</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">סדר: {record.sort_order}</p>
          </div>

          <div className="flex items-center gap-2">
            {!record.is_selectable && (
              <button
                type="button"
                onClick={() => openCreate(record.id)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
                aria-label={`הוסף תת-אזור ל${record.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => openEdit(record)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
              aria-label={`ערוך ${record.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            {record.name !== "ישראל" && (
              <button
                type="button"
                onClick={() => handleDelete(record)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                aria-label={`מחק ${record.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-foreground md:text-3xl">אזורים</h1>
              <p className="mt-1 text-sm text-muted-foreground">ניהול היררכיית האזורים — ישראל, קבוצות ותתי-אזורים</p>
            </div>
            <button type="button" onClick={() => openCreate()} className="ti-btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              אזור חדש
            </button>
          </div>
        </div>
      </div>

      {isBusy ? (
        <CenteredPageLoading />
      ) : (
        <div className="py-4">
          <div className="overflow-hidden rounded-none border-y border-border/60 bg-white">
            <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 md:px-8">
              <MapPinned className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{regions.length} אזורים במערכת</span>
            </div>
            {tree.map((node) => renderNode(node))}
          </div>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {editing ? "עריכת אזור" : "אזור חדש"}
            </h2>

            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium">שם</span>
                <input
                  className="ti-input w-full"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium">הורה</span>
                <select
                  className="ti-select w-full"
                  value={form.parent_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                >
                  <option value="">ללא הורה (שורש)</option>
                  {parentOptions
                    .filter((option) => option.id !== editing?.id)
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_selectable}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_selectable: e.target.checked }))}
                />
                אזור לבחירה (עלה — ניתן לשייך למקומות/מסלולים/טיולים)
              </label>

              {form.is_selectable && (
                <label className="block space-y-1">
                  <span className="text-sm font-medium">קוד אזור</span>
                  <select
                    className="ti-select w-full"
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value as Region | "" }))}
                    required
                  >
                    <option value="">בחרי קוד</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="block space-y-1">
                <span className="text-sm font-medium">סדר תצוגה</span>
                <input
                  type="number"
                  className="ti-input w-full"
                  value={form.sort_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                  min={0}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm"
                onClick={() => setDialogOpen(false)}
              >
                ביטול
              </button>
              <button type="submit" disabled={saving} className="ti-btn-primary px-4 py-2 text-sm">
                {saving ? "שומר..." : "שמירה"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
