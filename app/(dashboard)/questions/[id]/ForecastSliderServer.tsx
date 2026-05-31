"use client"

import { useRouter } from "next/navigation"
import { ForecastSlider } from "@/components/questions/ForecastSlider"

interface Props {
  questionId: string
  questionTitle: string
  latestForecast: { probability: unknown } | null
}

export function ForecastSliderServer({ questionId, questionTitle, latestForecast }: Props) {
  const router = useRouter()

  async function handleSubmit(probability: number, reasoning: string) {
    const res = await fetch(`/api/questions/${questionId}/forecasts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ probability, reasoning }),
    })
    if (res.ok) {
      router.refresh()
    }
  }

  return (
    <ForecastSlider
      questionId={questionId}
      questionTitle={questionTitle}
      initialProbability={latestForecast ? Number(latestForecast.probability) : undefined}
      onSubmit={handleSubmit}
    />
  )
}
