import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: userId } = await params
  if (userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const [questionCounts, forecastCount, scores] = await Promise.all([
    prisma.question.groupBy({
      by: ["status"],
      where: { authorId: userId, deletedAt: null },
      _count: true,
    }),
    prisma.forecast.count({ where: { userId } }),
    prisma.score.findMany({
      where: { userId },
      select: { brierScore: true },
    }),
  ])

  const statusMap = Object.fromEntries(questionCounts.map((r) => [r.status, r._count]))
  const brierValues = scores.map((s) => Number(s.brierScore))
  const avgBrier =
    brierValues.length > 0
      ? brierValues.reduce((a, b) => a + b, 0) / brierValues.length
      : null

  return NextResponse.json({
    totalQuestions: Object.values(statusMap).reduce((a: number, b) => a + (b as number), 0),
    openQuestions: (statusMap.OPEN ?? 0) + (statusMap.DRAFT ?? 0),
    resolvedQuestions: statusMap.RESOLVED ?? 0,
    avgBrierScore: avgBrier,
    totalForecasts: forecastCount,
    isRanked: brierValues.length >= 10,
  })
}
