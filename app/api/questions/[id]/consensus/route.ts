import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  const [latestSnapshot, userForecast] = await Promise.all([
    prisma.consensusSnapshot.findFirst({
      where: { questionId },
      orderBy: { computedAt: "desc" },
    }),
    prisma.forecast.findFirst({
      where: { questionId, userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ])

  if (!latestSnapshot) return NextResponse.json(null)

  // Build distribution histogram (10 bins)
  const allForecasts = await prisma.$queryRaw<Array<{ probability: number }>>`
    SELECT DISTINCT ON ("userId") CAST(probability AS FLOAT) as probability
    FROM forecast
    WHERE "questionId" = ${questionId}
    ORDER BY "userId", "createdAt" DESC
  `

  const bins = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${(i + 1) * 10}%`,
    min: i * 0.1,
    max: (i + 1) * 0.1,
    count: 0,
  }))

  for (const f of allForecasts) {
    const binIndex = Math.min(9, Math.floor(Number(f.probability) * 10))
    bins[binIndex].count++
  }

  const total = allForecasts.length || 1
  const distribution = bins.map(({ range, count }) => ({
    range,
    count,
    percentage: Math.round((count / total) * 100),
  }))

  return NextResponse.json({
    current: {
      forecastCount: latestSnapshot.forecastCount,
      mean: Number(latestSnapshot.meanProbability),
      median: Number(latestSnapshot.medianProbability),
      weighted: Number(latestSnapshot.weightedProbability),
      updatedAt: latestSnapshot.computedAt.toISOString(),
    },
    distribution,
    userForecast: userForecast ? Number(userForecast.probability) : null,
  })
}
