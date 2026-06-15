import type { MatchResult } from "@/lib/utils/match-score";
import { TripCard } from "@/components/features/trips/trip-card";

interface MatchScoreProps {
  result: MatchResult;
}

export function MatchScore({ result }: MatchScoreProps) {
  return (
    <div className="ti-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-3xl font-light text-primary">{result.score}%</span>
        <span className="text-sm text-muted-foreground">התאמה</span>
      </div>
      {result.explanation.length > 0 && (
        <ul className="text-sm text-muted-foreground space-y-1">
          {result.explanation.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}
      <TripCard trip={result.trip} showFavorite />
    </div>
  );
}
