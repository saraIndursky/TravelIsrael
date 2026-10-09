import type { EntityImage } from "@/types";

export interface GalleryDisplayItem {
  url: string;
  imageId?: string;
  canDelete: boolean;
}

export function mergeGalleryDisplayItems(
  staticUrls: string[],
  community: EntityImage[],
  currentUserId: string
): GalleryDisplayItem[] {
  const seen = new Set<string>();
  const items: GalleryDisplayItem[] = [];

  for (const url of staticUrls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    items.push({ url, canDelete: false });
  }

  for (const image of community) {
    if (!image.url || seen.has(image.url)) continue;
    seen.add(image.url);
    items.push({
      url: image.url,
      imageId: image.id,
      canDelete: Boolean(currentUserId) && image.user_id === currentUserId,
    });
  }

  return items;
}
