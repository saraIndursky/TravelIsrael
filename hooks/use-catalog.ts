"use client";

import { useCallback, useEffect, useState } from "react";
import type { Place, Trail } from "@/types";
import { getPlacesCatalog } from "@/lib/data/places";
import { getTrailsCatalog } from "@/lib/data/trails";

export function usePlacesTrailsCatalog() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getPlacesCatalog(), getTrailsCatalog()])
      .then(([nextPlaces, nextTrails]) => {
        if (cancelled) return;
        setPlaces(nextPlaces);
        setTrails(nextTrails);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  return { places, trails, loading, refresh };
}
