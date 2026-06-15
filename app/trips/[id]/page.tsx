import TripDetailClient from "@/components/features/trips/trip-detail-client";

export default function TripDetailPage({ params }: { params: { id: string } }) {
  return <TripDetailClient id={params.id} />;
}
