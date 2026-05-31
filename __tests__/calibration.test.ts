import { describe, it, expect } from "vitest"
import {
  probabilityToBucket,
  buildCalibrationCurve,
  calibrationDeviation,
  calibrationScore,
  CALIBRATION_BUCKETS,
} from "@/lib/calibration"

describe("probabilityToBucket", () => {
  it("maps 0.0–0.09 to 0.05", () => {
    expect(probabilityToBucket(0.0)).toBe(0.05)
    expect(probabilityToBucket(0.09)).toBe(0.05)
  })

  it("maps 0.10–0.19 to 0.15", () => {
    expect(probabilityToBucket(0.1)).toBe(0.15)
    expect(probabilityToBucket(0.19)).toBe(0.15)
  })

  it("maps 0.90–0.99 to 0.95", () => {
    expect(probabilityToBucket(0.95)).toBe(0.95)
    expect(probabilityToBucket(0.99)).toBe(0.95)
  })

  it("maps exactly 0.5 to 0.55", () => {
    expect(probabilityToBucket(0.5)).toBe(0.55)
  })
})

describe("buildCalibrationCurve", () => {
  it("returns empty array for empty input", () => {
    expect(buildCalibrationCurve([])).toEqual([])
  })

  it("filters out zero-count buckets", () => {
    const rows = [
      { bucket: 0.05, forecastCount: 0, resolutionCount: 0 },
      { bucket: 0.55, forecastCount: 10, resolutionCount: 5 },
    ]
    const curve = buildCalibrationCurve(rows)
    expect(curve).toHaveLength(1)
    expect(curve[0].bucket).toBe(0.55)
  })

  it("computes actual resolution rate correctly", () => {
    const rows = [{ bucket: 0.75, forecastCount: 20, resolutionCount: 15 }]
    const curve = buildCalibrationCurve(rows)
    expect(curve[0].actual).toBeCloseTo(0.75)
    expect(curve[0].predicted).toBe(0.75)
    expect(curve[0].count).toBe(20)
  })

  it("returns points sorted by bucket ascending", () => {
    const rows = [
      { bucket: 0.85, forecastCount: 5, resolutionCount: 4 },
      { bucket: 0.25, forecastCount: 8, resolutionCount: 2 },
    ]
    const curve = buildCalibrationCurve(rows)
    expect(curve[0].bucket).toBe(0.25)
    expect(curve[1].bucket).toBe(0.85)
  })
})

describe("calibrationDeviation", () => {
  it("returns null for fewer than 5 points", () => {
    const points = [
      { bucket: 0.05, predicted: 0.05, actual: 0.05, count: 10 },
      { bucket: 0.15, predicted: 0.15, actual: 0.15, count: 10 },
    ]
    expect(calibrationDeviation(points)).toBeNull()
  })

  it("returns 0 for perfect calibration", () => {
    const points = CALIBRATION_BUCKETS.map((b) => ({
      bucket: b,
      predicted: b,
      actual: b,
      count: 20,
    }))
    expect(calibrationDeviation(points)).toBeCloseTo(0)
  })

  it("returns positive deviation for miscalibrated forecaster", () => {
    const points = CALIBRATION_BUCKETS.map((b) => ({
      bucket: b,
      predicted: b,
      actual: 0.5,  // always predicts 50% regardless of stated probability
      count: 20,
    }))
    const dev = calibrationDeviation(points)
    expect(dev).not.toBeNull()
    expect(dev!).toBeGreaterThan(0)
  })
})

describe("calibrationScore", () => {
  it("returns 1.0 for zero deviation (perfect calibration)", () => {
    expect(calibrationScore(0)).toBe(1)
  })

  it("returns 0.0 for max deviation (0.25)", () => {
    expect(calibrationScore(0.25)).toBe(0)
  })

  it("clamps to [0, 1]", () => {
    expect(calibrationScore(-0.1)).toBe(1)
    expect(calibrationScore(0.5)).toBe(0)
  })

  it("returns 0.5 for deviation of 0.125", () => {
    expect(calibrationScore(0.125)).toBeCloseTo(0.5)
  })
})
