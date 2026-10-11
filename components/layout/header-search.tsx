"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  className?: string;
  /** Icon-only until focused — saves header space on small/medium screens */
  expandable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function HeaderSearch({
  className,
  expandable = false,
  expanded = false,
  onExpandedChange,
}: HeaderSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const isExpanded = expandable ? expanded : true;

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  function setExpanded(value: boolean) {
    onExpandedChange?.(value);
    if (!value) {
      setQuery("");
    }
  }

  function submitSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/search");
      setExpanded(false);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setExpanded(false);
  }

  function handleBlur() {
    if (!expandable) return;
    window.setTimeout(() => {
      if (!query.trim()) {
        setExpanded(false);
      }
    }, 150);
  }

  if (expandable && !isExpanded) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:border-foreground hover:text-foreground",
          className
        )}
        onClick={() => setExpanded(true)}
        aria-label="פתח חיפוש"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return (
    <form
      className={cn("relative min-w-0 flex-1", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submitSearch();
      }}
    >
      <Search
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            setExpanded(false);
          }
        }}
        placeholder="חיפוש טיול, מקום או מסלול..."
        className={cn(
          "w-full rounded-xl border border-border bg-background py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none",
          expandable ? "h-10 pl-10" : "h-10 pl-4"
        )}
        aria-label="חיפוש גלובלי"
      />
      {expandable && (
        <button
          type="button"
          className="absolute left-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setExpanded(false)}
          aria-label="סגור חיפוש"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
