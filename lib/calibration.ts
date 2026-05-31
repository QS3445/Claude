/** Calibration bin midpoints — 10 bins at 10% intervals. */
export const CALIBRATION_BUCKETS = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95]

export function probabilityToBucket(p: number): number {
  const bin = Math.floor(p * 10) / 10
  return Math.min(0.9, bin) + 0.05
}

export interface CalibrationPoint {
  bucket: number
  predicted: number
  actual: number
  count: number
}

/**
 * Build calibration curve from raw cache rows.
 * Returns points only for buckets with at least one forecast.
 */
export function buildCalibrationCurve(
  rows: Array<{ bucket: number; forecastCount: number; resolutionCount: number }>
): CalibrationPoint[] {
  return rows
    .filter((r) => r.forecastCount > 0)
    .map((r) => ({
      bucket: Number(r.bucket),
      predicted: Number(r.bucket),
      actual: r.resolutionCount / r.forecastCount,
      count: r.forecastCount,
    }))
    .sort((a, b) => a.bucket - b.bucket)
}

/**
 * Mean squared deviation from perfect calibration.
 * Returns null if fewer than 5 non-empty buckets.
 */
export function calibrationDeviation(points: CalibrationPoint[]): number | null {
  if (points.length < 5) return null
  const msd = points.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0) / points.length
  return msd
}

/** Normalized calibration score: 1.0 = perfect, 0.0 = worst possible. */
export function calibrationScore(deviation: number): number {
  return Math.max(0, Math.min(1, 1 - deviation / 0.25))
}
