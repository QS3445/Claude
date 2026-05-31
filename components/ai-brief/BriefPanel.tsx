"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPercent } from "@/lib/utils"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"

interface Brief {
  baseRateEstimate: number
  baseRateReasoning: string
  historicalExamples: Array<{ title: string; outcome: string; probability: number }>
  keyAssumptions: string[]
  bullCase: string
  bearCase: string
}

interface Props {
  questionId: string
  show: boolean
  onToggle: () => void
}

export function BriefPanel({ questionId, show, onToggle }: Props) {
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const loadBrief = useCallback(async () => {
    if (brief) { onToggle(); return }
    setLoading(true)
    setError("")
    try {
      let res = await fetch(`/api/questions/${questionId}/brief`)
      if (res.status === 404) {
        res = await fetch(`/api/questions/${questionId}/brief`, { method: "POST" })
      }
      if (!res.ok) throw new Error("Failed to generate analysis")
      const data = await res.json()
      setBrief(data)
      onToggle()
    } catch (e) {
      setError("Could not load AI analysis. Check your ANTHROPIC_API_KEY.")
    } finally {
      setLoading(false)
    }
  }, [brief, questionId, onToggle])

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={loadBrief}
        disabled={loading}
        className="w-full gap-2"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {loading ? "Generating analysis…" : show ? "Hide AI Analysis" : "Get AI Analysis"}
        {show ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {show && brief && (
        <Card className="mt-3 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Forecasting Brief
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                No probability recommended — decide yourself
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Base Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">
                  {formatPercent(Number(brief.baseRateEstimate))}
                </span>
                <span className="text-muted-foreground">{brief.baseRateReasoning}</span>
              </div>
            </div>

            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Historical Examples</p>
              <div className="space-y-1.5">
                {brief.historicalExamples.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Badge variant={ex.outcome === "YES" ? "success" : "secondary"} className="shrink-0 mt-0.5">
                      {ex.outcome}
                    </Badge>
                    <span className="text-muted-foreground">{ex.title}</span>
                    <span className="tabular-nums ml-auto font-medium">{formatPercent(ex.probability)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Key Assumptions (YES depends on)</p>
              <ul className="space-y-1">
                {brief.keyAssumptions.map((a, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-green-50 dark:bg-green-950 p-3">
                <p className="font-medium text-xs text-green-700 dark:text-green-300 mb-1">Bull Case</p>
                <p className="text-xs text-muted-foreground">{brief.bullCase}</p>
              </div>
              <div className="rounded-md bg-red-50 dark:bg-red-950 p-3">
                <p className="font-medium text-xs text-red-700 dark:text-red-300 mb-1">Bear Case</p>
                <p className="text-xs text-muted-foreground">{brief.bearCase}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
