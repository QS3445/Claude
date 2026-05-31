import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createQuestionSchema } from "@/lib/validations"
import { z } from "zod"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status")
  const category = searchParams.get("category")
  const visibility = searchParams.get("visibility")
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)))

  const where = {
    authorId: session.user.id,
    deletedAt: null,
    ...(status && { status: status as never }),
    ...(category && { category: category as never }),
    ...(visibility && { visibility: visibility as never }),
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { forecasts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
  ])

  return NextResponse.json({ questions, total, page, limit })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = createQuestionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { deadline, ...rest } = parsed.data

  const question = await prisma.question.create({
    data: {
      ...rest,
      authorId: session.user.id,
      deadline: deadline ? new Date(deadline) : null,
    },
  })

  return NextResponse.json(question, { status: 201 })
}
