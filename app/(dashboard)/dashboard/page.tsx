import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { QuestionCard } from "@/components/questions/QuestionCard"
import { serializeForecastSnippets } from "@/lib/serializers"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const userId = session.user.id

  const [questionCounts, forecastCount, scores, recentQuestions] = await Promise.all([
    prisma.question.groupBy({
      by: ["status"],
      where: { authorId: userId, deletedAt: null },
      _count: true,
    }),
    prisma.forecast.count({ where: { userId } }),
    prisma.score.findMany({ where: { userId }, select: { brierScore: true } }),
    prisma.question.findMany({
      where: { authorId: userId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { forecasts: true } },
        forecasts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { probability: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ])

  const statusMap = Object.fromEntries(questionCounts.map((r) => [r.status, r._count]))
  const brierValues = scores.map((s) => Number(s.brierScore))
  const avgBrier = brierValues.length > 0
    ? brierValues.reduce((a, b) => a + b, 0) / brierValues.length
    : null

  const stats = {
    totalQuestions: Object.values(statusMap).reduce((a: number, b) => a + (b as number), 0),
    openQuestions: (statusMap.OPEN ?? 0) + (statusMap.DRAFT ?? 0),
    resolvedQuestions: statusMap.RESOLVED ?? 0,
    avgBrierScore: avgBrier,
    totalForecasts: forecastCount,
    isRanked: brierValues.length >= 10,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {session.user.name}</p>
      </div>

      <StatsCard {...stats} />

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Questions</h2>
        {recentQuestions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No questions yet.</p>
            <p className="text-sm mt-1">
              <a href="/questions/new" className="text-primary hover:underline">Create your first question</a>
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recentQuestions.map((q) => (
              <QuestionCard
                key={q.id}
                question={{ ...q, forecasts: serializeForecastSnippets(q.forecasts) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
