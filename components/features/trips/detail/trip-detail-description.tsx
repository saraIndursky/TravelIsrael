"use client";

import { useState } from "react";

interface TripDetailDescriptionProps {
  description: string;
  variant?: "default" | "compact";
  title?: string;
  truncateAt?: number;
}

export function TripDetailDescription({
  description,
  variant = "default",
  title = "על הטיול",
  truncateAt = 400,
}: TripDetailDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const text = description || "אין תיאור זמין";
  const shouldTruncate = text.length > truncateAt;

  return (
    <section
      className={
        variant === "compact" ? "py-4" : "print-tight mx-auto max-w-7xl px-6 py-16"
      }
    >
      <h2 className="mb-6 text-3xl font-light">{title}</h2>
      <p className="leading-relaxed text-gray-700">
        <span className={shouldTruncate ? "print:hidden" : undefined}>
          {expanded || !shouldTruncate ? text : `${text.substring(0, truncateAt)}...`}
        </span>
        {shouldTruncate && <span className="hidden print:inline">{text}</span>}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 font-medium hover:underline print:hidden"
        >
          {expanded ? "קרא פחות" : "קרא עוד"}
        </button>
      )}
    </section>
  );
}
