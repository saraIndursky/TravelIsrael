"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TripStation } from "@/types";
import { GripVertical, MapPin, Route, X } from "lucide-react";
import { resolveStationDetails } from "@/lib/utils/trip-calculations";
import { getStore } from "@/lib/data/store";
import { formatDuration } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StationListDnDProps {
  stations: TripStation[];
  onChange: (stations: TripStation[]) => void;
}

function SortableStation({ station, index, onRemove }: { station: TripStation; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: station.id });
  const store = getStore();
  const details = resolveStationDetails(station, store.places, store.trails);

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-lg border p-3 bg-card">
      <button {...attributes} {...listeners} className="cursor-grab"><GripVertical className="h-4 w-4 text-muted-foreground" /></button>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">{index + 1}</span>
      {station.station_type === "place" ? <MapPin className="h-4 w-4 text-blue-500" /> : <Route className="h-4 w-4 text-green-500" />}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{details?.name}</p>
        <p className="text-xs text-muted-foreground">{details?.type} · {details ? formatDuration(details.duration) : ""}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove}><X className="h-4 w-4" /></Button>
    </li>
  );
}

export function StationListDnD({ stations, onChange }: StationListDnDProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stations.findIndex((s) => s.id === active.id);
    const newIndex = stations.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(stations, oldIndex, newIndex).map((s, i) => ({ ...s, order_index: i }));
    onChange(reordered);
  };

  if (stations.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">הוסף תחנות לטיול</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={stations.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {stations.map((station, i) => (
            <SortableStation
              key={station.id}
              station={station}
              index={i}
              onRemove={() => onChange(stations.filter((s) => s.id !== station.id).map((s, idx) => ({ ...s, order_index: idx })))}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
