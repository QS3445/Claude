/**
 * Pure scoring functions. No Prisma or Next.js dependencies.
 * outcome: 1.0 = YES resolved, 0.0 = NO resolved
 * probability: 0.0001–0.9999 (never exactly 0 or 1)
 */

export function brierScore(probability: number, outcome: 0 | 1): number {
  return Math.pow(probability - outcome, 2)
}

export function logScore(probability: number, outcome: 0 | 1): number {
  if (outcome === 1) return Math.log(probability)
  return Math.log(1 - probability)
}

export function resolutionToOutcome(resolution: "YES" | "NO"): 0 | 1 {
  return resolution === "YES" ? 1 : 0
}

/** Average Brier score across a set of scores. Lower is better; 0.25 = random. */
export function meanBrierScore(scores: number[]): number | null {
  if (scores.length === 0) return null
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}

/** Weighted probability using inverse Brier score weights. */
export function weightedMeanProbability(
  forecasts: Array<{ probability: number; brierScore: number | null }>
): number {
  const EPSILON = 0.01

  let weightedSum = 0
  let totalWeight = 0

  for (const f of forecasts) {
    // Users without a Brier score (new) get weight of a random guesser: 1/(0.25+ε)
    const brier = f.brierScore ?? 0.25
    const weight = 1 / (brier + EPSILON)
    weightedSum += weight * f.probability
    totalWeight += weight
  }

  if (totalWeight === 0) return 0.5
  return weightedSum / totalWeight
}

export function medianProbability(probabilities: number[]): number {
  if (probabilities.length === 0) return 0.5
  const sorted = [...probabilities].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2
  return sorted[mid]
}

export function meanProbability(probabilities: number[]): number {
  if (probabilities.length === 0) return 0.5
  return probabilities.reduce((sum, p) => sum + p, 0) / probabilities.length
}
