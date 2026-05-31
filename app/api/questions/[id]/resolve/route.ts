import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resolveQuestionSchema } from "@/lib/validations"
import { brierScore, logScore, resolutionToOutcome } from "@/lib/scoring"
import { buildCalibrationCurve, calibrationDeviation, calibrationScore, probabilityToBucket, CALIBRATION_BUCKETS } from "@/lib/calibration"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  const question = await prisma.question.findFirst({
    where: { id: questionId, authorId: session.user.id, deletedAt: null },
  })

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!["OPEN", "CLOSED"].includes(question.status)) {
    return NextResponse.json({ error: "Question is not in a resolvable state" }, { status: 409 })
  }

  const body = await request.json()
  const parsed = resolveQuestionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { resolution, resolutionNote, sources } = parsed.data

  await prisma.$transaction(async (tx) => {
    // 1. Mark question resolved
    await tx.question.update({
      where: { id: questionId },
      data: {
        status: resolution === "AMBIGUOUS" ? "AMBIGUOUS" : "RESOLVED",
        resolution,
        resolutionNote,
        resolvedAt: new Date(),
        resolvedById: session.user.id,
      },
    })

    // 2. Lock final forecasts (mark isFinal for latest per user)
    await tx.$executeRaw`
      UPDATE forecast
      SET "isFinal" = true
      WHERE id IN (
        SELECT DISTINCT ON ("userId") id
        FROM forecast
        WHERE "questionId" = ${questionId}
        ORDER BY "userId", "createdAt" DESC
      )
    `

    // 3. Add resolution sources
    if (sources?.length) {
      await tx.resolutionSource.createMany({
        data: sources.map((s) => ({
          questionId,
          addedById: session.user.id,
          url: s.url,
          title: s.title,
          excerpt: s.excerpt,
        })),
      })
    }

    // 4. Compute scores (skip AMBIGUOUS — not scored)
    if (resolution !== "AMBIGUOUS") {
      const outcome = resolutionToOutcome(resolution)

      const finalForecasts = await tx.forecast.findMany({
        where: { questionId, isFinal: true },
      })

      for (const forecast of finalForecasts) {
        const prob = Number(forecast.probability)
        const brier = brierScore(prob, outcome)
        const log = logScore(prob, outcome)

        await tx.score.upsert({
          where: { questionId_userId: { questionId, userId: forecast.userId } },
          create: {
            questionId,
            userId: forecast.userId,
            brierScore: brier,
            logScore: log,
            finalProbability: prob,
            resolution,
          },
          update: {
            brierScore: brier,
            logScore: log,
            finalProbability: prob,
            resolution,
          },
        })
      }

      // 5. Update calibration cache for each forecaster
      const affectedUserIds = [...new Set(finalForecasts.map((f) => f.userId))]
      for (const userId of affectedUserIds) {
        await updateCalibrationCache(tx, userId, questionId, outcome)
      }
    }
  })

  return NextResponse.json({ success: true })
}

async function updateCalibrationCache(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  userId: string,
  questionId: string,
  outcome: 0 | 1
) {
  const forecast = await tx.forecast.findFirst({
    where: { questionId, userId, isFinal: true },
  })
  if (!forecast) return

  const bucket = probabilityToBucket(Number(forecast.probability))

  await tx.calibrationCache.upsert({
    where: { userId_bucket: { userId, bucket } },
    create: {
      userId,
      bucket,
      forecastCount: 1,
      resolutionCount: outcome,
    },
    update: {
      forecastCount: { increment: 1 },
      resolutionCount: { increment: outcome },
    },
  })

  // Recompute calibration score for this user
  const allBuckets = await tx.calibrationCache.findMany({ where: { userId } })
  const points = buildCalibrationCurve(
    allBuckets.map((b) => ({
      bucket: Number(b.bucket),
      forecastCount: b.forecastCount,
      resolutionCount: b.resolutionCount,
    }))
  )
  const deviation = calibrationDeviation(points)
  if (deviation !== null) {
    const score = calibrationScore(deviation)
    await tx.calibrationScore.upsert({
      where: { userId },
      create: { userId, score, bucketCount: points.length },
      update: { score, bucketCount: points.length, computedAt: new Date() },
    })
  }
}
