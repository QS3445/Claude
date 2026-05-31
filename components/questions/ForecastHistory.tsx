import { formatDistanceToNow } from "date-fns"
import { formatPercent } from "@/lib/utils"

interface ForecastEntry {
  id: string
  probability: unknown
  reasoning: string
  createdAt: Date
  isFinal: boolean
}

interface Props {
  forecasts: ForecastEntry[]
}

export function ForecastHistory({ forecasts }: Props) {
  if (forecasts.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Your Forecast History
      </h3>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {[...forecasts].reverse().map((f, i) => (
            <div key={f.id} className="relative pl-8">
              <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tabular-nums text-primary">
                  {formatPercent(Number(f.probability))}
                </span>
                {f.isFinal && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    final
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}
                </span>
              </div>
              {f.reasoning && (
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.reasoning}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
