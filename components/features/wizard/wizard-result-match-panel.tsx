import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMatchStyle } from "@/lib/utils/match-display";

interface WizardResultMatchPanelProps {
  score: number;
  explanation: string[];
}

export function WizardResultMatchPanel({ score, explanation }: WizardResultMatchPanelProps) {
  const matchStyle = getMatchStyle(score);

  return (
    <div className={cn("rounded-sm border p-6", matchStyle.bgLight, matchStyle.border)}>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#111827]">
        <CheckCircle2 className={cn("h-5 w-5", matchStyle.color)} />
        כמה זה מתאים לך?
      </h3>

      {explanation.length > 0 && (
        <ul className="space-y-3">
          {explanation.map((reason) => (
            <li key={reason} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  matchStyle.bgStrong
                )}
              >
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
              <span className="text-[#374151]">{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className={cn("mt-6 border-t pt-6", matchStyle.border)}>
        <div className="mb-2 flex items-center justify-between">
          <span className={cn("text-sm", matchStyle.color)}>ציון התאמה</span>
          <span className={cn("text-2xl font-bold", matchStyle.color)}>{score}%</span>
        </div>
        <div className={cn("h-2 overflow-hidden rounded-full", matchStyle.bgMedium)}>
          <div
            className={cn("h-full rounded-full transition-all duration-1000", matchStyle.bgStrong)}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
