export type PopularityLevel = "high" | "medium" | "low";

export function computePopularity(views: number, saves: number, rating: number): PopularityLevel {
  const score = views * 0.3 + saves * 2 + rating * 15;
  if (score >= 80) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export const POPULARITY_LABELS: Record<PopularityLevel, string> = {
  high: "גבוהה",
  medium: "בינונית",
  low: "נמוכה",
};
