import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QuestionCard } from "@/components/questions/QuestionCard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const { status, category } = await searchParams

  const questions = await prisma.question.findMany({
    where: {
      authorId: session.user.id,
      deletedAt: null,
      ...(status && { status: status as never }),
      ...(category && { category: category as never }),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { forecasts: true } },
      forecasts: {
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { probability: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Questions</h1>
        <Button asChild>
          <Link href="/questions/new">
            <Plus className="h-4 w-4" />
            New Question
          </Link>
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No questions yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}
