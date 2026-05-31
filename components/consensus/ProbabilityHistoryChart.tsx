"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { format } from "date-fns"

interface HistoryPoint {
  mean: number
  median: number
  weighted: number
  forecastCount: number
  date: string
}

interface Props {
  questionId: string
  userForecast: number | null
}

export function ProbabilityHistoryChart({ questionId, userForecast }: Props) {
  const [history, setHistory] = useState<HistoryPoint[]>([])

  useEffect(() => {
    fetch(`/api/questions/${questionId}/consensus/history`)
      .then((r) => r.json())
      .then(setHistory)
  }, [questionId])

  if (history.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Not enough data yet. History appears after multiple forecasters submit.
      </p>
    )
  }

  const chartData = history.map((h) => ({
    date: format(new Date(h.date), "MMM d"),
    Mean: Math.round(h.mean * 100),
    Weighted: Math.round(h.weighted * 100),
    forecastCount: h.forecastCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => `${v}%`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Mean" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Weighted" stroke="hsl(var(--chart-2))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        {userForecast !== null && (
          <ReferenceLine
            y={Math.round(userForecast * 100)}
            stroke="hsl(var(--chart-3))"
            strokeDasharray="3 3"
            label={{ value: "You", position: "right", fontSize: 11 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
