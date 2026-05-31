import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildCalibrationCurve } from "@/lib/calibration"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: userId } = await params
  if (userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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

  return NextResponse.json({
    curve,
    score: calibScore ? Number(calibScore.score) : null,
    bucketCount: calibScore?.bucketCount ?? 0,
    isValid: (calibScore?.bucketCount ?? 0) >= 5,
  })
}
