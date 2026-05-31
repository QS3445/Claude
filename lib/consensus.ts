import { prisma } from "@/lib/prisma"
import { meanProbability, medianProbability, weightedMeanProbability } from "@/lib/scoring"

/**
 * Compute and persist a new ConsensusSnapshot for a question.
 * Must be called within the same transaction as a forecast submission.
 */
export async function computeAndSaveConsensus(questionId: string) {
  // Fetch all current (latest per user) forecasts for this question
  const latestForecasts = await prisma.$queryRaw<
    Array<{ userId: string; probability: number; brier_score: number | null }>
  >`
    SELECT DISTINCT ON (f."userId")
      f."userId",
      CAST(f.probability AS FLOAT) as probability,
      CAST(s."brierScore" AS FLOAT) as brier_score
    FROM forecast f
    LEFT JOIN (
      SELECT "userId", AVG(CAST("brierScore" AS FLOAT)) as "brierScore"
      FROM score
      GROUP BY "userId"
    ) s ON s."userId" = f."userId"
    WHERE f."questionId" = ${questionId}
    ORDER BY f."userId", f."createdAt" DESC
  `

  if (latestForecasts.length === 0) return

  const probs = latestForecasts.map((f) => Number(f.probability))
  const mean = meanProbability(probs)
  const median = medianProbability(probs)
  const weighted = weightedMeanProbability(
    latestForecasts.map((f) => ({
      probability: Number(f.probability),
      brierScore: f.brier_score,
    }))
  )

  await prisma.consensusSnapshot.create({
    data: {
      questionId,
      forecastCount: latestForecasts.length,
      meanProbability: mean,
      medianProbability: median,
      weightedProbability: weighted,
    },
  })
}
