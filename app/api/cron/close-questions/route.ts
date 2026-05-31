import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find all OPEN questions whose deadline has passed
  const expired = await prisma.question.findMany({
    where: {
      status: "OPEN",
      deadline: { lte: new Date() },
      deletedAt: null,
    },
    select: { id: true },
  })

  if (expired.length === 0) return NextResponse.json({ closed: 0 })

  const ids = expired.map((q) => q.id)

  await prisma.$transaction(async (tx) => {
    // Mark questions CLOSED
    await tx.question.updateMany({
      where: { id: { in: ids } },
      data: { status: "CLOSED" },
    })

    // Lock final forecasts for all affected questions
    for (const questionId of ids) {
      await tx.$executeRaw`
        UPDATE forecast
        SET "isFinal" = true
        WHERE id IN (
          SELECT DISTINCT ON ("userId") id
          FROM forecast
          WHERE "questionId" = ${questionId}
            AND "isFinal" = false
          ORDER BY "userId", "createdAt" DESC
        )
      `
    }
  })

  return NextResponse.json({ closed: expired.length, questionIds: ids })
}
