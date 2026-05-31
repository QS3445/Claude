import { Card, CardContent } from "@/components/ui/card"
import { formatBrier } from "@/lib/utils"

interface Props {
  totalQuestions: number
  openQuestions: number
  resolvedQuestions: number
  avgBrierScore: number | null
  totalForecasts: number
  isRanked: boolean
}

export function StatsCard({ totalQuestions, openQuestions, resolvedQuestions, avgBrierScore, totalForecasts, isRanked }: Props) {
  const stats = [
    { label: "Total Questions", value: totalQuestions },
    { label: "Open", value: openQuestions },
    { label: "Resolved", value: resolvedQuestions },
    { label: "Total Forecasts", value: totalForecasts },
    {
      label: "Avg Brier Score",
      value: avgBrierScore !== null ? formatBrier(avgBrierScore) : "—",
      sub: avgBrierScore !== null ? (avgBrierScore < 0.1 ? "Excellent" : avgBrierScore < 0.2 ? "Good" : "Improving") : `${isRanked ? "" : "Resolve 10 questions to rank"}`,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, sub }) => (
        <Card key={label}>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
