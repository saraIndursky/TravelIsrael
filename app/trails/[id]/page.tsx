import type { Metadata } from "next";
import { getPublicTrailByIdServer } from "@/lib/data/server/trails";
import { buildEntityMetadata } from "@/lib/seo/metadata";
import { trailPath } from "@/lib/utils/content-path";
import TrailDetailClient from "@/components/features/trails/trail-detail-client";
import { notFound } from "next/navigation";
import { contentExistsServer } from "@/lib/data/server/exists";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const trail = await getPublicTrailByIdServer(params.id);
  return buildEntityMetadata(
    trail
      ? { name: trail.name, shortDescription: trail.short_description, imageUrl: trail.image_url }
      : null,
    {
      notFoundTitle: "מסלול לא נמצא — TravelIsrael",
      fallbackDescription: "מסלול בישראל",
      canonicalPath: trail ? trailPath(trail) : undefined,
    }
  );
}

export default async function TrailPage({ params }: { params: { id: string } }) {
  if (!(await contentExistsServer("trails", params.id))) notFound();
  return <TrailDetailClient id={params.id} />;
}
