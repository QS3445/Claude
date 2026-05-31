import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stats = await prisma.$queryRaw<
    Array<{
      category: string
      total: number
      active: number
      forecasts: number
      avg_brier: number | null
    }>
  >`
    SELECT
      q.category::text,
      COUNT(DISTINCT q.id)::int                     as total,
      COUNT(DISTINCT q.id) FILTER (WHERE q.status = 'OPEN')::int as active,
      COUNT(f.id)::int                              as forecasts,
      AVG(CAST(s."brierScore" AS FLOAT))            as avg_brier
    FROM question q
    LEFT JOIN forecast f ON f."questionId" = q.id
    LEFT JOIN score s ON s."questionId" = q.id
    WHERE q."deletedAt" IS NULL
      AND q.visibility = 'PUBLIC'
    GROUP BY q.category
  `

  for (const row of stats) {
    await prisma.categoryStats.upsert({
      where: { category: row.category as never },
      create: {
        category: row.category as never,
        totalQuestions: row.total,
        activeQuestions: row.active,
        totalForecasts: row.forecasts,
        avgBrierScore: row.avg_brier,
      },
      update: {
        totalQuestions: row.total,
        activeQuestions: row.active,
        totalForecasts: row.forecasts,
        avgBrierScore: row.avg_brier,
      },
    })
  }

  return NextResponse.json({ updated: stats.length })
}
