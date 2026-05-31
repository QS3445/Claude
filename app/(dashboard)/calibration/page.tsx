import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CalibrationChart } from "@/components/charts/CalibrationChart"
import { buildCalibrationCurve } from "@/lib/calibration"

export default async function CalibrationPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const userId = session.user.id

  const [cacheRows, calibScore] = await Promise.all([
    prisma.calibrationCache.findMany({ where: { userId } }),
    prisma.calibrationScore.findUnique({ where: { userId } }),
  ])

  const curve = buildCalibrationCurve(
    cacheRows.map((r) => ({
      bucket: Number(r.bucket),
      forecastCount: r.forecastCount,
      resolutionCount: r.resolutionCount,
    }))
  )

  const score = calibScore ? Number(calibScore.score) : null
  const bucketCount = calibScore?.bucketCount ?? 0
  const isValid = bucketCount >= 5

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Calibration</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Are your 70% predictions right 70% of the time?
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <CalibrationChart points={curve} score={score} isValid={isValid} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cacheRows
          .sort((a, b) => Number(a.bucket) - Number(b.bucket))
          .map((row) => {
            const actual = row.forecastCount > 0 ? row.resolutionCount / row.forecastCount : null
            const bucket = Math.round(Number(row.bucket) * 100)
            const diff = actual !== null ? actual - Number(row.bucket) : null
            return (
              <div key={row.id} className="rounded-md border p-3 text-center">
                <p className="text-sm font-semibold">{bucket}% bucket</p>
                <p className="text-lg font-bold tabular-nums">
                  {actual !== null ? `${Math.round(actual * 100)}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">{row.forecastCount} forecasts</p>
                {diff !== null && (
                  <p className={`text-xs ${Math.abs(diff) < 0.05 ? "text-green-600" : "text-amber-600"}`}>
                    {diff > 0 ? "+" : ""}{Math.round(diff * 100)}pp
                  </p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
