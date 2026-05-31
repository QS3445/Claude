import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateQuestionSchema } from "@/lib/validations"

async function getQuestionOrFail(id: string, userId: string) {
  const question = await prisma.question.findFirst({
    where: { id, deletedAt: null },
  })
  if (!question) return { error: "Not found", status: 404 }
  if (question.authorId !== userId) return { error: "Forbidden", status: 403 }
  return { question }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const question = await prisma.question.findFirst({
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
  })

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Latest forecast by this user
  const userForecast = await prisma.forecast.findFirst({
    where: { questionId: id, userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ question, userForecast })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const result = await getQuestionOrFail(id, session.user.id)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  const body = await request.json()
  const parsed = updateQuestionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { deadline, ...rest } = parsed.data
  const updated = await prisma.question.update({
    where: { id },
    data: {
      ...rest,
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const result = await getQuestionOrFail(id, session.user.id)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status })

  await prisma.question.update({ where: { id }, data: { deletedAt: new Date() } })
  return new NextResponse(null, { status: 204 })
}
