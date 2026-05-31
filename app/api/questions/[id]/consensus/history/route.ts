import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  const snapshots = await prisma.consensusSnapshot.findMany({
    where: { questionId },
    orderBy: { computedAt: "asc" },
    select: {
      meanProbability: true,
      medianProbability: true,
      weightedProbability: true,
      forecastCount: true,
      computedAt: true,
    },
  })

  return NextResponse.json(
    snapshots.map((s) => ({
      mean: Number(s.meanProbability),
      median: Number(s.medianProbability),
      weighted: Number(s.weightedProbability),
      forecastCount: s.forecastCount,
      date: s.computedAt.toISOString(),
    }))
  )
}
