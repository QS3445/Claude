import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MIN_RESOLVED = 10

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const category = searchParams.get("category")

  const rows = await prisma.$queryRaw<
    Array<{
      userId: string
      name: string
      image: string | null
      username: string | null
      avg_brier: number
      resolved_count: number
      total_forecasts: number
    }>
  >`
    SELECT
      u.id as "userId",
      u.name,
      u.image,
      p.username,
      AVG(CAST(s."brierScore" AS FLOAT)) as avg_brier,
      COUNT(s.id)::int as resolved_count,
      COUNT(DISTINCT f.id)::int as total_forecasts
    FROM "user" u
    JOIN score s ON s."userId" = u.id
    JOIN forecast f ON f."userId" = u.id
    JOIN question q ON q.id = s."questionId"
    LEFT JOIN profile p ON p."userId" = u.id
    WHERE q."deletedAt" IS NULL
      AND (p."isPublic" = true OR u.id = ${session.user.id})
      ${category ? prisma.$queryRaw`AND q.category = ${category}::"Category"` : prisma.$queryRaw``}
    GROUP BY u.id, u.name, u.image, p.username
    HAVING COUNT(s.id) >= ${MIN_RESOLVED}
    ORDER BY avg_brier ASC
    LIMIT 50
  `

  return NextResponse.json(
    rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      name: r.name,
      image: r.image,
      username: r.username,
      avgBrier: Number(r.avg_brier).toFixed(4),
      resolvedCount: r.resolved_count,
      totalForecasts: r.total_forecasts,
      isCurrentUser: r.userId === session.user.id,
    }))
  )
}
