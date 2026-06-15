import PlaceDetailClient from "@/components/features/places/place-detail-client";

export default function PlacePage({ params }: { params: { id: string } }) {
  return <PlaceDetailClient id={params.id} />;
}
