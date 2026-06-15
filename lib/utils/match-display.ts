export interface MatchStyle {
  text: string;
  color: string;
  bgLight: string;
  bgMedium: string;
  bgStrong: string;
  border: string;
}

export function getMatchStyle(score: number): MatchStyle {
  if (score >= 90) {
    return {
      text: "התאמה מושלמת",
      color: "text-emerald-600",
      bgLight: "bg-emerald-50",
      bgMedium: "bg-emerald-200",
      bgStrong: "bg-emerald-600",
      border: "border-emerald-600",
    };
  }
  if (score >= 70) {
    return {
      text: "התאמה טובה",
      color: "text-blue-600",
      bgLight: "bg-blue-50",
      bgMedium: "bg-blue-200",
      bgStrong: "bg-blue-600",
      border: "border-blue-600",
    };
  }
  if (score >= 50) {
    return {
      text: "התאמה בינונית",
      color: "text-amber-600",
      bgLight: "bg-amber-50",
      bgMedium: "bg-amber-200",
      bgStrong: "bg-amber-600",
      border: "border-amber-600",
    };
  }
  return {
    text: "התאמה נמוכה",
    color: "text-red-600",
    bgLight: "bg-red-50",
    bgMedium: "bg-red-200",
    bgStrong: "bg-red-600",
    border: "border-red-600",
  };
}
