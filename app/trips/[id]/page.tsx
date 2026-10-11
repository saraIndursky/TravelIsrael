import type { Metadata } from "next";
import { getPublicTripByIdServer } from "@/lib/data/server/trips";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { tripPath } from "@/lib/utils/content-path";
import TripDetailClient from "@/components/features/trips/trip-detail-client";
import { notFound } from "next/navigation";
import { contentExistsServer } from "@/lib/data/server/exists";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const trip = await getPublicTripByIdServer(params.id);
  return buildEntityMetadata(
    trip
      ? { name: trip.name, shortDescription: trip.short_description, imageUrl: trip.main_image }
      : null,
    {
      notFoundTitle: "טיול לא נמצא — TravelIsrael",
      fallbackDescription: "טיול בישראל",
      canonicalPath: trip ? tripPath(trip) : undefined,
    }
  );
}

export default async function TripDetailPage({ params }: { params: { id: string } }) {
  if (!(await contentExistsServer("trips", params.id))) notFound();
  return <TripDetailClient id={params.id} />;
}
