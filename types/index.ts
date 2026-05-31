import type { Prisma } from "@prisma/client"

export type QuestionWithAuthor = Prisma.QuestionGetPayload<{
  include: { author: { select: { id: true; name: true; image: true } } }
}>

export type QuestionWithDetails = Prisma.QuestionGetPayload<{
  include: {
    author: { select: { id: true; name: true; image: true } }
    forecasts: {
      orderBy: { createdAt: "desc" }
      take: 1
      select: { probability: true; createdAt: true }
    }
    _count: { select: { forecasts: true } }
  }
}>

export type ForecastWithUser = Prisma.ForecastGetPayload<{
  include: { user: { select: { id: true; name: true; image: true } } }
}>

export type CalibrationPoint = {
  bucket: number
  predicted: number
  actual: number
  count: number
}

export type ConsensusData = {
  current: {
    forecastCount: number
    mean: number
    median: number
    weighted: number
    updatedAt: string
  }
  distribution: Array<{ range: string; count: number; percentage: number }>
  userForecast: number | null
}

export type UserStats = {
  totalQuestions: number
  openQuestions: number
  resolvedQuestions: number
  avgBrierScore: number | null
  totalForecasts: number
  isRanked: boolean
}
