import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPercent } from "@/lib/utils"

type StatusVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive"

const STATUS_STYLES: Record<string, StatusVariant> = {
  DRAFT: "secondary",
  OPEN: "success",
  CLOSED: "warning",
  RESOLVED: "default",
  AMBIGUOUS: "outline",
}

const CATEGORY_LABELS: Record<string, string> = {
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  POLITICS: "Politics",
  SCIENCE: "Science",
  PERSONAL: "Personal",
  UNCATEGORIZED: "Uncategorized",
}

interface Props {
  question: {
    id: string
    title: string
    category: string
    status: string
    deadline: Date | null
    createdAt: Date
    _count: { forecasts: number }
    forecasts?: Array<{ probability: unknown }>
  }
}

export function QuestionCard({ question }: Props) {
  const latestProb = question.forecasts?.[0]?.probability
  const probability = latestProb ? Number(latestProb) : null

  return (
    <Link href={`/questions/${question.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm leading-snug line-clamp-2">{question.title}</h3>
            {probability !== null && (
              <span className="text-lg font-bold tabular-nums text-primary shrink-0">
                {formatPercent(probability)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant={STATUS_STYLES[question.status] ?? "outline"}>
              {question.status}
            </Badge>
            <Badge variant="outline">{CATEGORY_LABELS[question.category] ?? question.category}</Badge>
            <span>{question._count.forecasts} forecasts</span>
            {question.deadline && (
              <span>
                {question.status === "OPEN" ? "Closes " : "Closed "}
                {formatDistanceToNow(new Date(question.deadline), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
