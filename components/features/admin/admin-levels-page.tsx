"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CenteredPageLoading } from "@/components/layout/page-loading";
import {
  getAccessibilityLevels,
  getDifficultyLevels,
  updateAccessibilityLevel,
  updateDifficultyLevel,
} from "@/lib/data/levels";
import { getSeedLevels, type AccessibilityLevel, type DifficultyLevel } from "@/lib/levels";
import type { Difficulty } from "@/types/enums";

const MAX_NAME_LENGTH = 40;
const MAX_DESCRIPTION_LENGTH = 600;

interface LevelRowProps {
  /** Small label before the name, e.g. "רמה 3". */
  badge: string;
  name: string;
  description: string;
  defaultName: string;
  defaultDescription: string;
  onSave: (text: { name: string; description: string }) => Promise<void>;
}

function LevelRow({ badge, name, description, defaultName, defaultDescription, onSave }: LevelRowProps) {
  const [nameDraft, setNameDraft] = useState(name);
  const [descriptionDraft, setDescriptionDraft] = useState(description);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNameDraft(name);
    setDescriptionDraft(description);
  }, [name, description]);

  const dirty = nameDraft.trim() !== name || descriptionDraft.trim() !== description;
  const isDefault = nameDraft.trim() === defaultName && descriptionDraft.trim() === defaultDescription;

  async function save() {
    setSaving(true);
    try {
      await onSave({ name: nameDraft, description: descriptionDraft });
      toast({ title: "הרמה נשמרה" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "שגיאה בשמירת הרמה",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-3 border-b border-border/60 px-4 py-5 last:border-b-0 lg:grid-cols-[5rem_12rem_minmax(0,1fr)_auto] lg:px-6">
      <div className="pt-2 text-sm font-medium text-muted-foreground">{badge}</div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">שם</label>
        <input
          className="ti-input"
          dir="rtl"
          value={nameDraft}
          maxLength={MAX_NAME_LENGTH}
          onChange={(e) => setNameDraft(e.target.value)}
          aria-label={`שם — ${badge}`}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">הסבר שמוצג למשתמשים</label>
        <textarea
          className="min-h-[5.5rem] w-full rounded-xl border border-border bg-white px-4 py-2.5 text-right text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          dir="rtl"
          value={descriptionDraft}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          aria-label={`הסבר — ${badge}`}
        />
      </div>
      <div className="flex items-end gap-2 lg:flex-col lg:items-stretch lg:justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving || !nameDraft.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save className="h-4 w-4" />
          {saving ? "שומר..." : "שמירה"}
        </button>
        <button
          type="button"
          onClick={() => {
            setNameDraft(defaultName);
            setDescriptionDraft(defaultDescription);
          }}
          disabled={isDefault || saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          title="ממלא את השדות בנוסח המקורי. כדי להחיל, יש ללחוץ על שמירה"
        >
          <RotateCcw className="h-4 w-4" />
          נוסח מקורי
        </button>
      </div>
    </div>
  );
}

/** Admin screen for the names and explanations of the accessibility and difficulty levels. */
type LevelsTab = "accessibility" | "difficulty";

export function AdminLevelsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LevelsTab>("accessibility");
  const [accessibility, setAccessibility] = useState<AccessibilityLevel[] | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel[] | null>(null);
  const seed = getSeedLevels();

  async function load() {
    try {
      const [a, d] = await Promise.all([getAccessibilityLevels(), getDifficultyLevels()]);
      setAccessibility(a);
      setDifficulty(d);
    } catch {
      toast({ title: "טעינת הרמות נכשלה", variant: "destructive" });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (!accessibility || !difficulty) return <CenteredPageLoading />;

  return (
    <div className="min-h-full bg-secondary/30">
      <div className="border-b border-border/60 bg-white">
        <div className="px-4 py-6 md:px-8">
          <p className="text-sm text-muted-foreground">הסברים שמוצגים בטפסים, בסינון ובאשף</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">רמות נגישות וקושי</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            אפשר לערוך את השם ואת ההסבר של כל רמה. מספר הרמות וסדרן קבועים, כי הצבעים, חישוב קושי הטיול
            והתאמה באשף נשענים עליהם. שינוי מופיע לכל המשתמשים בתוך חצי דקה.
          </p>
        </div>
      </div>

      {/* Tabs: same look as the lists in the other admin screens */}
      <div className="border-b border-border/60 bg-white">
        <div className="flex gap-1 overflow-x-auto px-4 md:px-8" role="tablist" aria-label="סוג הרמות">
          {[
            { value: "accessibility" as const, label: "נגישות", count: accessibility.length },
            { value: "difficulty" as const, label: "קושי", count: difficulty.length },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Both panels stay mounted so what was typed in one tab survives switching to the other. */}
      <div className="px-4 py-6 md:px-8">
        <div role="tabpanel" hidden={activeTab !== "accessibility"}>
          <p className="mb-3 text-sm text-muted-foreground">רמה 1 היא הפחות נגישה, ורמה 5 הנגישה ביותר.</p>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
            {accessibility.map((level) => {
              const original = seed.accessibility.find((entry) => entry.level === level.level);
              return (
                <LevelRow
                  key={level.level}
                  badge={`רמה ${level.level}`}
                  name={level.name}
                  description={level.description}
                  defaultName={original?.name ?? level.name}
                  defaultDescription={original?.description ?? level.description}
                  onSave={async (text) => {
                    await updateAccessibilityLevel(level.level, text);
                    await load();
                    router.refresh();
                  }}
                />
              );
            })}
          </div>
        </div>

        <div role="tabpanel" hidden={activeTab !== "difficulty"}>
          <p className="mb-3 text-sm text-muted-foreground">מסודרות מהקל אל הקשה.</p>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
            {difficulty.map((level) => {
              const original = seed.difficulty.find((entry) => entry.code === level.code);
              return (
                <LevelRow
                  key={level.code}
                  badge={`דרגה ${level.sortOrder}`}
                  name={level.name}
                  description={level.description}
                  defaultName={original?.name ?? level.name}
                  defaultDescription={original?.description ?? level.description}
                  onSave={async (text) => {
                    await updateDifficultyLevel(level.code as Difficulty, text);
                    await load();
                    router.refresh();
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
