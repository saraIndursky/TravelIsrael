"use client";

import { useState } from "react";

interface TripDetailDescriptionProps {
  description: string;
  variant?: "default" | "compact";
}

export function TripDetailDescription({
  description,
  variant = "default",
}: TripDetailDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const text = description || "אין תיאור זמין";
  const shouldTruncate = text.length > 400;

  return (
    <section
      className={
        variant === "compact" ? "py-4" : "mx-auto max-w-7xl px-6 py-16"
      }
    >
      <h2 className="mb-6 text-3xl font-light">על הטיול</h2>
      <p className="leading-relaxed text-gray-700">
        {expanded || !shouldTruncate ? text : `${text.substring(0, 400)}...`}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 font-medium hover:underline"
        >
          {expanded ? "קרא פחות" : "קרא עוד"}
        </button>
      )}
    </section>
  );
}
