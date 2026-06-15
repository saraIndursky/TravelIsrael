"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  polyline?: [number, number][];
}

const MapInner = dynamic(() => import("./map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-muted" />,
});

export function MapView({ markers, center, zoom = 10, className, polyline }: MapViewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={`animate-pulse rounded-lg bg-muted ${className ?? "h-64"}`} />;
  }

  return <MapInner markers={markers} center={center} zoom={zoom} className={className} polyline={polyline} />;
}
