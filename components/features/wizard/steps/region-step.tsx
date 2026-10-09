"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Region } from "@/types";
import type { RegionTreeNode } from "@/types/region";
import { getRegionTree } from "@/lib/data/regions";
import { WizardStepHeading } from "../wizard-step-heading";
import { PageLoadingSpinner } from "@/components/layout/page-loading";

export interface RegionSelection {
  region?: Region;
  regionGroup?: string;
}

interface RegionStepProps {
  region?: Region;
  regionGroup?: string;
  onSelect: (selection: RegionSelection) => void;
}

function getBorderColor(level: number): string {
  switch (level) {
    case 0:
      return "border-border";
    case 1:
      return "border-border/80";
    case 2:
      return "border-muted-foreground/30";
    default:
      return "border-muted-foreground/50";
  }
}

function getBackgroundByLevel(level: number): string {
  switch (level) {
    case 0:
      return "bg-white";
    case 1:
      return "bg-muted/20";
    case 2:
      return "bg-muted/40";
    default:
      return "bg-muted/60";
  }
}

export function RegionStep({ region, regionGroup, onSelect }: RegionStepProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [tree, setTree] = useState<RegionTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getRegionTree()
      .then((nodes) => {
        if (!cancelled) {
          setTree(nodes);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isSelected = (node: RegionTreeNode): boolean => {
    if (node.name === "ישראל") return !region && !regionGroup;
    if (node.children?.length) return regionGroup === node.name && !region;
    if (node.code) return region === node.code;
    return false;
  };

  const handleSelect = (node: RegionTreeNode) => {
    if (node.name === "ישראל") {
      onSelect({});
      return;
    }
    if (node.children?.length) {
      onSelect({ regionGroup: node.name });
      return;
    }
    if (node.code) {
      onSelect({ region: node.code });
    }
  };

  const renderNode = (node: RegionTreeNode, level = 0) => {
    const hasChildren = Boolean(node.children?.length);
    const isExpanded = expanded.includes(node.id);
    const selected = isSelected(node);

    return (
      <div key={node.id} style={{ marginInlineStart: level * 20 }}>
        <div
          className={cn(
            "mb-1 flex min-h-[56px] items-stretch overflow-hidden rounded-sm border-2 transition-all",
            selected
              ? "scale-[1.01] border-primary bg-indigo-50 shadow-sm"
              : cn(getBackgroundByLevel(level), getBorderColor(level), "hover:border-muted-foreground/40")
          )}
        >
          <button
            type="button"
            onClick={() => handleSelect(node)}
            className="min-w-0 flex-1 bg-transparent p-4 text-right text-sm font-medium text-foreground"
          >
            {node.name}
          </button>
          {hasChildren && (
            <button
              type="button"
              aria-label={isExpanded ? `סגור ${node.name}` : `פתח ${node.name}`}
              aria-expanded={isExpanded}
              onClick={() => toggle(node.id)}
              className="flex w-12 shrink-0 items-center justify-center border-s border-border/60 bg-transparent hover:bg-muted/40"
            >
              <ChevronDown
                className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
              />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">{node.children?.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <WizardStepHeading
        title="באיזה אזור תרצו לטייל?"
        subtitle="לחיצה על השורה בוחרת את האזור — החץ פותח תת-אזורים"
      />
      {loading ? (
        <PageLoadingSpinner size="sm" className="py-8" />
      ) : (
        <div className="space-y-3">{tree.map((node) => renderNode(node))}</div>
      )}
    </div>
  );
}
