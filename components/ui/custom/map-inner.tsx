"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "./map-view";

const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/** Zooms the map so every marker (and the route line) is visible, instead of stacking nearby pins. */
function FitToContent({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

interface MapInnerProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  polyline?: [number, number][];
}

export default function MapInner({ markers, center, zoom = 10, className, polyline }: MapInnerProps) {
  const mapCenter: [number, number] = center ?? (markers[0] ? [markers[0].lat, markers[0].lng] : [31.5, 34.8]);
  const fitPoints: [number, number][] = [...markers.map((m): [number, number] => [m.lat, m.lng]), ...(polyline ?? [])];

  return (
    <div className={className ?? "h-64 w-full rounded-lg overflow-hidden"}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToContent points={fitPoints} />
        {polyline && polyline.length > 1 && (
          <Polyline positions={polyline} color="#3b82f6" weight={3} />
        )}
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={defaultIcon} alt={m.label ?? "סמן במפה"} title={m.label}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
