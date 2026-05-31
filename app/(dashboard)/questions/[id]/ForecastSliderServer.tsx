"use client"

import { useRouter } from "next/navigation"
import { ForecastSlider } from "@/components/questions/ForecastSlider"
import type { SerializedForecast } from "@/lib/serializers"

interface Props {
  questionId: string
  questionTitle: string
  latestForecast: Pick<SerializedForecast, "probability"> | null
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
      initialProbability={latestForecast?.probability}
      onSubmit={handleSubmit}
    />
  )
}
