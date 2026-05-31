"use client"

import { useState, useTransition } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { BriefPanel } from "@/components/ai-brief/BriefPanel"

interface Props {
  questionId: string
  initialProbability?: number
  questionTitle: string
  onSubmit: (probability: number, reasoning: string) => Promise<void>
}

export function ForecastSlider({ questionId, initialProbability, questionTitle, onSubmit }: Props) {
  const [probability, setProbability] = useState(initialProbability ? Math.round(initialProbability * 100) : 50)
  const [reasoning, setReasoning] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [showBrief, setShowBrief] = useState(false)

  function handleSubmit() {
    if (reasoning.trim().length < 10) {
      setError("Please write at least 10 characters of reasoning.")
      return
    }
    setError("")
    startTransition(async () => {
      await onSubmit(probability, reasoning)
      setReasoning("")
    })
  }

  const color =
    probability >= 70 ? "text-green-600" : probability <= 30 ? "text-red-600" : "text-blue-600"

  return (
    <div className="space-y-4">
      <BriefPanel questionId={questionId} show={showBrief} onToggle={() => setShowBrief(!showBrief)} />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Your probability estimate</Label>
          <span className={`text-2xl font-bold tabular-nums ${color}`}>{probability}%</span>
        </div>
        <Slider
          min={1}
          max={99}
          step={1}
          value={[probability]}
          onValueChange={([v]) => setProbability(v)}
          className="my-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1% — Very unlikely</span>
          <span>50% — Uncertain</span>
          <span>99% — Near certain</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reasoning">
          Reasoning <span className="text-muted-foreground">(required)</span>
        </Label>
        <Textarea
          id="reasoning"
          placeholder="Why do you believe this? What evidence are you weighing? What would change your mind?"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          rows={4}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
          {isPending ? "Submitting…" : initialProbability ? "Update Forecast" : "Submit Forecast"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowBrief(!showBrief)}>
          {showBrief ? "Hide" : "AI Analysis"}
        </Button>
      </div>
    </div>
  )
}
