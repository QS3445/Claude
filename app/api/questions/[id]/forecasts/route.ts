import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createForecastSchema } from "@/lib/validations"
import { computeAndSaveConsensus } from "@/lib/consensus"
import { percentToProbability } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  const forecasts = await prisma.forecast.findMany({
    where: { questionId, userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(forecasts)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      deletedAt: null,
      status: "OPEN",
      OR: [{ authorId: session.user.id }, { visibility: { in: ["PUBLIC", "UNLISTED"] } }],
    },
  })

  if (!question) {
    return NextResponse.json(
      { error: "Question not found or not accepting forecasts" },
      { status: 404 }
    )
  }

  const body = await request.json()
  const parsed = createForecastSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const probability = percentToProbability(parsed.data.probability)

  // Write forecast and optionally update consensus in one transaction
  const forecast = await prisma.$transaction(async (tx) => {
    const created = await tx.forecast.create({
      data: {
        questionId,
        userId: session.user.id,
        probability,
        reasoning: parsed.data.reasoning,
      },
    })
    return created
  })

  // Consensus update outside transaction — non-critical, can fail silently
  if (question.visibility !== "PRIVATE") {
    await computeAndSaveConsensus(questionId).catch(console.error)
  }

  return NextResponse.json(forecast, { status: 201 })
}
