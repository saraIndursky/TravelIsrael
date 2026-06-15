"use client";

import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapMarker } from "./map-view";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapInnerProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  polyline?: [number, number][];
}

export default function MapInner({ markers, center, zoom = 10, className, polyline }: MapInnerProps) {
  const mapCenter: [number, number] = center ?? (markers[0] ? [markers[0].lat, markers[0].lng] : [31.5, 34.8]);

  return (
    <div className={className ?? "h-64 w-full rounded-lg overflow-hidden"}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polyline && polyline.length > 1 && (
          <Polyline positions={polyline} color="#3b82f6" weight={3} />
        )}
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={defaultIcon}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
