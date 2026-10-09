"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityListPage } from "@/components/features/admin/admin-entity-list-page";
import { AdminTripApproveModal } from "@/components/features/admin/admin-list-modals";
import { tripsAdminConfig } from "@/components/features/admin/admin-entity-configs";
import { useAuthStore } from "@/hooks/use-stores";
import { getUsers } from "@/lib/data/auth";
import {
  approveTripCascade,
  getTripPendingStationContent,
  hasPendingStationContent,
  type TripPendingStationContent,
} from "@/lib/data/trip-approval";
import { deleteTrip, getAllTripsAdmin, rejectTrip, removeTripFromSite, restoreTrip } from "@/lib/data/trips";
import { notifyContentRemoved, notifyContentStatusChange } from "@/lib/notifications/client";
import type { Place, Trail, Trip, User } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { placePath, trailPath } from "@/lib/utils/content-path";

export default function AdminTripsPage() {
  const { role } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTrip, setApproveTrip] = useState<Trip | null>(null);
  const [pendingContent, setPendingContent] = useState<TripPendingStationContent | null>(null);
  const [approving, setApproving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [allTrips, allUsers] = await Promise.all([getAllTripsAdmin(), getUsers()]);
    setTrips(allTrips);
    setUsers(allUsers);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (role === "admin") load();
  }, [role, load]);

  const closeApproveModal = useCallback(() => {
    if (approving) return;
    setApproveTrip(null);
    setPendingContent(null);
  }, [approving]);

  const notifyApprovedEntity = useCallback(
    async (input: {
      entityType: "place" | "trail" | "trip";
      entityId: string;
      entityName: string;
      ownerId: string | null;
      region: Place["region"] | Trail["region"] | Trip["region"];
      regionId?: string | null;
    }) => {
      await notifyContentStatusChange({
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        ownerId: input.ownerId,
        status: "approved",
        region: input.region,
        regionId: input.regionId,
      });
    },
    []
  );

  const confirmApprove = useCallback(async () => {
    if (!approveTrip) return;

    setApproving(true);
    try {
      await approveTripCascade(approveTrip.id);
      await notifyApprovedEntity({
        entityType: "trip",
        entityId: approveTrip.id,
        entityName: approveTrip.name,
        ownerId: approveTrip.created_by,
        region: approveTrip.region,
        regionId: approveTrip.region_id,
      });
      for (const place of pendingContent?.places ?? []) {
        await notifyApprovedEntity({
          entityType: "place",
          entityId: place.id,
          entityName: place.name,
          ownerId: place.created_by,
          region: place.region,
          regionId: place.region_id,
        });
      }
      for (const trail of pendingContent?.trails ?? []) {
        await notifyApprovedEntity({
          entityType: "trail",
          entityId: trail.id,
          entityName: trail.name,
          ownerId: trail.created_by,
          region: trail.region,
          regionId: trail.region_id,
        });
      }
      await load();
      const approvedCount =
        (pendingContent?.places.length ?? 0) + (pendingContent?.trails.length ?? 0);
      toast({
        title: "הטיול אושר",
        description:
          approvedCount > 0 ? `גם ${approvedCount} מקומות/מסלולים ממתינים אושרו אוטומטית` : undefined,
      });
      setApproveTrip(null);
      setPendingContent(null);
    } catch (error) {
      toast({
        title: "אישור הטיול נכשל",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  }, [approveTrip, pendingContent, load, notifyApprovedEntity]);

  const modalPlaces = useMemo(
    () =>
      (pendingContent?.places ?? []).map((place) => ({
        id: place.id,
        name: place.name,
        href: placePath(place),
        typeLabel: place.place_type,
      })),
    [pendingContent]
  );

  const modalTrails = useMemo(
    () =>
      (pendingContent?.trails ?? []).map((trail) => ({
        id: trail.id,
        name: trail.name,
        href: trailPath(trail),
        typeLabel: `${trail.trail_type} • ${trail.length_km} ק״מ`,
      })),
    [pendingContent]
  );

  if (role !== "admin") return null;

  return (
    <>
      <AdminEntityListPage
        config={tripsAdminConfig}
        items={trips}
        users={users}
        loading={loading}
        onApprove={async (item) => {
          try {
            const pending = await getTripPendingStationContent(item.id);
            if (hasPendingStationContent(pending)) {
              setPendingContent(pending);
              setApproveTrip(item);
              return;
            }

            await approveTripCascade(item.id);
            await notifyApprovedEntity({
              entityType: "trip",
              entityId: item.id,
              entityName: item.name,
              ownerId: item.created_by,
              region: item.region,
              regionId: item.region_id,
            });
            await load();
            toast({ title: "הטיול אושר" });
          } catch (error) {
            toast({
              title: "אישור הטיול נכשל",
              description: error instanceof Error ? error.message : undefined,
              variant: "destructive",
            });
          }
        }}
        onReject={async (item, reason) => {
          await rejectTrip(item.id, reason);
          await notifyContentStatusChange({
            entityType: "trip",
            entityId: item.id,
            entityName: item.name,
            ownerId: item.created_by,
            status: "rejected",
            rejectionReason: reason,
          });
          await load();
          toast({ title: "הטיול נדחה" });
        }}
        onUnpublish={async (item, reason) => {
          await removeTripFromSite(item.id, reason);
          await notifyContentRemoved({
            entityType: "trip",
            entityId: item.id,
            entityName: item.name,
            ownerId: item.created_by,
            removalReason: reason,
          });
          await load();
          toast({ title: "הטיול הוסר מהאתר" });
        }}
        onDelete={async (item) => {
          try {
            await deleteTrip(item.id);
            await load();
            toast({ title: "הטיול נמחק" });
          } catch (error) {
            toast({
              title: "מחיקה נכשלה",
              description: error instanceof Error ? error.message : undefined,
              variant: "destructive",
            });
          }
        }}
        onRestore={async (item) => {
          await restoreTrip(item.id);
          await load();
          toast({ title: "הטיול הוחזר לבדיקה" });
        }}
      />

      <AdminTripApproveModal
        open={Boolean(approveTrip && pendingContent)}
        tripName={approveTrip?.name ?? ""}
        places={modalPlaces}
        trails={modalTrails}
        loading={approving}
        onConfirm={() => void confirmApprove()}
        onClose={closeApproveModal}
      />
    </>
  );
}
