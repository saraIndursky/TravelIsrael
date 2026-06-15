"use client";

import { useEffect, useState } from "react";

export function useFooterVisible(footerSelector = "[data-site-footer]"): boolean {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector(footerSelector);
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [footerSelector]);

  return footerVisible;
}
