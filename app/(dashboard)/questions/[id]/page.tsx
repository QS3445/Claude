import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serializeForecasts } from "@/lib/serializers"
import { ForecastSliderServer } from "./ForecastSliderServer"
import { ForecastHistory } from "@/components/questions/ForecastHistory"
import { ConsensusPanel } from "@/components/consensus/ConsensusPanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const { id } = await params

  const [question, forecasts] = await Promise.all([
    prisma.question.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { authorId: session.user.id },
          { visibility: { in: ["PUBLIC", "UNLISTED"] } },
        ],
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        resolutionSources: true,
        _count: { select: { forecasts: true } },
      },
    }),
    prisma.forecast.findMany({
      where: { questionId: id, userId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
  ])

  if (!question) notFound()

  const isAuthor = question.authorId === session.user.id
  const userScore = await prisma.score.findUnique({
    where: { questionId_userId: { questionId: id, userId: session.user.id } },
  })

  // Serialize before crossing the server→client boundary.
  // Prisma Decimal and Date instances cannot be passed as RSC props.
  const serializedForecasts = serializeForecasts(forecasts)

  const canForecast = question.status === "OPEN"
  const showConsensus = question.visibility !== "PRIVATE"

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <div className="flex items-start gap-2 flex-wrap">
          <Badge variant={question.status === "OPEN" ? "success" : "secondary"}>
            {question.status}
          </Badge>
          <Badge variant="outline">{question.category}</Badge>
          {question.visibility !== "PRIVATE" && (
            <Badge variant="outline">{question.visibility}</Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-snug">{question.title}</h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>by {question.author.name}</span>
          {question.deadline && (
            <span>
              {question.status === "OPEN"
                ? `closes ${formatDistanceToNow(question.deadline, { addSuffix: true })}`
                : `closed ${format(question.deadline, "MMM d, yyyy")}`}
            </span>
          )}
          <span>{question._count.forecasts} forecasts</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm leading-relaxed">{question.description}</p>
        <div className="rounded-md bg-muted p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Resolution Criteria
          </p>
          <p className="text-sm">{question.resolutionCriteria}</p>
        </div>
      </div>

      {question.status === "RESOLVED" && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">
            Resolved: {question.resolution}
          </p>
          {question.resolutionNote && (
            <p className="text-sm text-green-700 mt-1">{question.resolutionNote}</p>
          )}
          {userScore && (
            <p className="text-sm mt-2 text-green-700">
              Your Brier score on this question:{" "}
              <strong>{Number(userScore.brierScore).toFixed(4)}</strong>
            </p>
          )}
          {question.resolutionSources.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-green-800 mb-1">Sources</p>
              {question.resolutionSources.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:underline block"
                >
                  {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {showConsensus && <ConsensusPanel questionId={id} />}

      {canForecast && (
        <div className="rounded-lg border p-4 space-y-4">
          <h2 className="font-semibold">
            {forecasts.length > 0 ? "Update Your Forecast" : "Submit Your Forecast"}
          </h2>
          <ForecastSliderServer
            questionId={id}
            questionTitle={question.title}
            latestForecast={serializedForecasts.at(-1) ?? null}
          />
        </div>
      )}

      {serializedForecasts.length > 0 && <ForecastHistory forecasts={serializedForecasts} />}

      {isAuthor && ["OPEN", "CLOSED"].includes(question.status) && (
        <div className="border-t pt-4">
          <Button variant="outline" asChild>
            <Link href={`/questions/${id}/resolve`}>Resolve Question</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
