"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  LineChart,
} from "recharts"
import type { CalibrationPoint } from "@/types"

interface Props {
  points: CalibrationPoint[]
  score: number | null
  isValid: boolean
}

export function CalibrationChart({ points, score, isValid }: Props) {
  if (!isValid || points.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-2">
        <p className="text-muted-foreground text-sm">
          Calibration chart requires at least 5 filled probability buckets
          from resolved questions.
        </p>
        <p className="text-xs text-muted-foreground">Resolve more questions to unlock this.</p>
      </div>
    )
  }

  // Perfect calibration reference line points
  const perfectLine = [
    { predicted: 0, actual: 0 },
    { predicted: 100, actual: 100 },
  ]

  const chartData = points.map((p) => ({
    predicted: Math.round(p.predicted * 100),
    actual: Math.round(p.actual * 100),
    count: p.count,
    bucket: `${Math.round(p.bucket * 100)}%`,
  }))

  return (
    <div className="space-y-3">
      {score !== null && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Calibration score</span>
          <span className="text-xl font-bold">{(score * 100).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">/100</span>
          <div className="ml-auto w-32 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${score * 100}%` }}
            />
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="predicted"
            name="Predicted"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
            label={{ value: "Predicted probability", position: "bottom", offset: -5, fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="actual"
            name="Actual"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11 }}
            label={{ value: "Actual frequency", angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="rounded-md border bg-background p-2 text-xs shadow-md">
                  <p>Predicted: <strong>{d.predicted}%</strong></p>
                  <p>Actual: <strong>{d.actual}%</strong></p>
                  <p>Forecasts: <strong>{d.count}</strong></p>
                </div>
              )
            }}
          />
          {/* Perfect calibration diagonal */}
          <ReferenceLine
            segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
            label={{ value: "Perfect", position: "insideTopLeft", fontSize: 10 }}
          />
          <Scatter data={chartData} fill="hsl(var(--primary))" opacity={0.8} />
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center">
        Points above the diagonal = overconfident. Points below = underconfident.
      </p>
    </div>
  )
}
