import TrailDetailClient from "@/components/features/trails/trail-detail-client";

export default function TrailPage({ params }: { params: { id: string } }) {
  return <TrailDetailClient id={params.id} />;
}
