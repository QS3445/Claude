import { describe, it, expect } from "vitest"
import {
  brierScore,
  logScore,
  resolutionToOutcome,
  meanBrierScore,
  weightedMeanProbability,
  medianProbability,
  meanProbability,
} from "@/lib/scoring"

describe("brierScore", () => {
  it("returns 0 for perfect YES prediction", () => {
    expect(brierScore(1.0, 1)).toBe(0)
  })

  it("returns 0 for perfect NO prediction", () => {
    expect(brierScore(0.0, 0)).toBe(0)
  })

  it("returns 1 for worst possible YES prediction", () => {
    expect(brierScore(0.0, 1)).toBe(1)
  })

  it("returns 1 for worst possible NO prediction", () => {
    expect(brierScore(1.0, 0)).toBe(1)
  })

  it("returns 0.25 for random guesser at 50%", () => {
    expect(brierScore(0.5, 1)).toBe(0.25)
    expect(brierScore(0.5, 0)).toBe(0.25)
  })

  it("is symmetric around 50%", () => {
    expect(brierScore(0.7, 1)).toBeCloseTo(brierScore(0.3, 0))
  })
})

describe("logScore", () => {
  it("returns 0 for certain correct prediction", () => {
    expect(logScore(1.0, 1)).toBeCloseTo(0)
    expect(logScore(0.0001, 0)).toBeCloseTo(Math.log(0.9999))
  })

  it("returns large negative for certain wrong prediction", () => {
    expect(logScore(0.0001, 1)).toBeLessThan(-9)
  })

  it("YES outcome uses log(probability)", () => {
    expect(logScore(0.7, 1)).toBeCloseTo(Math.log(0.7))
  })

  it("NO outcome uses log(1 - probability)", () => {
    expect(logScore(0.7, 0)).toBeCloseTo(Math.log(0.3))
  })
})

describe("resolutionToOutcome", () => {
  it("maps YES to 1", () => expect(resolutionToOutcome("YES")).toBe(1))
  it("maps NO to 0", () => expect(resolutionToOutcome("NO")).toBe(0))
})

describe("meanBrierScore", () => {
  it("returns null for empty array", () => {
    expect(meanBrierScore([])).toBeNull()
  })

  it("returns correct mean", () => {
    expect(meanBrierScore([0.1, 0.3])).toBeCloseTo(0.2)
  })
})

describe("medianProbability", () => {
  it("returns 0.5 for empty array", () => {
    expect(medianProbability([])).toBe(0.5)
  })

  it("returns middle value for odd-length array", () => {
    expect(medianProbability([0.1, 0.5, 0.9])).toBe(0.5)
  })

  it("returns average of two middle values for even-length array", () => {
    expect(medianProbability([0.2, 0.4, 0.6, 0.8])).toBeCloseTo(0.5)
  })
})

describe("meanProbability", () => {
  it("returns 0.5 for empty array", () => {
    expect(meanProbability([])).toBe(0.5)
  })

  it("returns correct mean", () => {
    expect(meanProbability([0.3, 0.7])).toBeCloseTo(0.5)
  })
})

describe("weightedMeanProbability", () => {
  it("gives higher weight to forecasters with lower Brier scores", () => {
    const forecasts = [
      { probability: 0.8, brierScore: 0.04 },  // good forecaster, high prob
      { probability: 0.2, brierScore: 0.24 },  // poor forecaster, low prob
    ]
    const result = weightedMeanProbability(forecasts)
    // Good forecaster (weight ~24) should dominate over poor forecaster (weight ~4)
    expect(result).toBeGreaterThan(0.65)
  })

  it("gives equal weight when all forecasters have null Brier scores", () => {
    const forecasts = [
      { probability: 0.3, brierScore: null },
      { probability: 0.7, brierScore: null },
    ]
    expect(weightedMeanProbability(forecasts)).toBeCloseTo(0.5)
  })

  it("returns 0.5 for empty array", () => {
    expect(weightedMeanProbability([])).toBe(0.5)
  })
})
