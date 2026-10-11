import type { Metadata } from "next";
import { getPublicPlaceByIdServer } from "@/lib/data/server/places";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { placePath } from "@/lib/utils/content-path";
import PlaceDetailClient from "@/components/features/places/place-detail-client";
import { notFound } from "next/navigation";
import { contentExistsServer } from "@/lib/data/server/exists";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const place = await getPublicPlaceByIdServer(params.id);
  return buildEntityMetadata(
    place
      ? { name: place.name, shortDescription: place.short_description, imageUrl: place.image_url }
      : null,
    {
      notFoundTitle: "מקום לא נמצא — TravelIsrael",
      fallbackDescription: "מקום לביקור בישראל",
      canonicalPath: place ? placePath(place) : undefined,
    }
  );
}

export default async function PlacePage({ params }: { params: { id: string } }) {
  if (!(await contentExistsServer("places", params.id))) notFound();
  return <PlaceDetailClient id={params.id} />;
}
