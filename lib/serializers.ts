import type { Forecast, Score, Question, Prisma } from "@prisma/client"

/**
 * Strip Prisma Decimal and Date objects before crossing the server→client boundary.
 * Next.js cannot serialize class instances (Decimal, Date) as RSC props.
 * Use these helpers in Server Components before passing data to any Client Component.
 */

export type SerializedForecast = {
  id: string
  questionId: string
  userId: string
  probability: number
  reasoning: string
  isFinal: boolean
  createdAt: string
}

export type SerializedScore = {
  id: string
  questionId: string
  userId: string
  brierScore: number
  logScore: number
  finalProbability: number
  resolution: string
  computedAt: string
}

// Minimal shape used by QuestionCard's nested forecast snippet
export type SerializedForecastSnippet = {
  probability: number
}

export function serializeForecast(f: Forecast): SerializedForecast {
  return {
    id: f.id,
    questionId: f.questionId,
    userId: f.userId,
    probability: Number(f.probability),
    reasoning: f.reasoning,
    isFinal: f.isFinal,
    createdAt: f.createdAt.toISOString(),
  }
}

export function serializeForecasts(fs: Forecast[]): SerializedForecast[] {
  return fs.map(serializeForecast)
}

export function serializeScore(s: Score): SerializedScore {
  return {
    id: s.id,
    questionId: s.questionId,
    userId: s.userId,
    brierScore: Number(s.brierScore),
    logScore: Number(s.logScore),
    finalProbability: Number(s.finalProbability),
    resolution: s.resolution,
    computedAt: s.computedAt.toISOString(),
  }
}

/** Serialize the nested `forecasts` snippet on a Question row (one-item array from take:1). */
export function serializeForecastSnippets(
  snippets: Array<{ probability: Prisma.Decimal | number }>
): SerializedForecastSnippet[] {
  return snippets.map((s) => ({ probability: Number(s.probability) }))
}
