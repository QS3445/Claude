"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProbabilityHistoryChart } from "./ProbabilityHistoryChart"
import { ForecastDistribution } from "./ForecastDistribution"
import { formatPercent } from "@/lib/utils"
import type { ConsensusData } from "@/types"

interface Props {
  questionId: string
}

export function ConsensusPanel({ questionId }: Props) {
  const [data, setData] = useState<ConsensusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/questions/${questionId}/consensus`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [questionId])

  if (loading) return <div className="h-32 rounded-lg bg-muted animate-pulse" />
  if (!data) return null

  const { current, distribution, userForecast } = data

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Community Consensus</CardTitle>
          <span className="text-xs text-muted-foreground">{current.forecastCount} forecasters</span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { label: "Mean", value: current.mean },
            { label: "Median", value: current.median },
            { label: "Weighted", value: current.weighted },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold tabular-nums text-primary">
                {formatPercent(value)}
              </div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        {userForecast !== null && (
          <p className="text-xs text-muted-foreground pt-1">
            Your forecast: <span className="font-semibold">{formatPercent(userForecast)}</span>
            {userForecast > current.mean + 0.1 && " — above consensus"}
            {userForecast < current.mean - 0.1 && " — below consensus"}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="history">
          <TabsList className="mb-4">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <ProbabilityHistoryChart questionId={questionId} userForecast={userForecast} />
          </TabsContent>
          <TabsContent value="distribution">
            <ForecastDistribution distribution={distribution} userForecast={userForecast} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
