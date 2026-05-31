"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatPercent } from "@/lib/utils"

interface Props {
  distribution: Array<{ range: string; count: number; percentage: number }>
  userForecast: number | null
}

export function ForecastDistribution({ distribution, userForecast }: Props) {
  const userBin = userForecast !== null ? Math.min(9, Math.floor(userForecast * 10)) : -1

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={distribution} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number) => [`${v} forecasters`, "Count"]} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {distribution.map((_, index) => (
              <Cell
                key={index}
                fill={index === userBin ? "hsl(var(--chart-3))" : "hsl(var(--primary))"}
                opacity={index === userBin ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {userForecast !== null && (
        <p className="text-xs text-muted-foreground text-center">
          Your forecast ({formatPercent(userForecast)}) is highlighted
        </p>
      )}
    </div>
  )
}
