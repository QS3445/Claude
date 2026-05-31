import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"

const MODEL = "claude-haiku-4-5-20251001"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params
  const brief = await prisma.forecastingBrief.findUnique({ where: { questionId } })

  if (!brief) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(brief)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: questionId } = await params

  // Return cached brief if it already exists
  const existing = await prisma.forecastingBrief.findUnique({ where: { questionId } })
  if (existing) return NextResponse.json(existing)

  const question = await prisma.question.findFirst({
    where: { id: questionId, deletedAt: null },
  })
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI briefs not configured" }, { status: 503 })
  }

  const prompt = `You are a calibration assistant helping a forecaster think clearly about a prediction question. Do NOT recommend a specific probability — only surface relevant considerations.

Question: ${question.title}
Resolution criteria: ${question.resolutionCriteria}
Deadline: ${question.deadline?.toISOString() ?? "No deadline set"}
Category: ${question.category}
Description: ${question.description}

Respond with a JSON object matching this exact schema:
{
  "baseRateEstimate": <number 0.0-1.0>,
  "baseRateReasoning": <string: 1-2 sentences explaining the base rate>,
  "historicalExamples": [
    { "title": <string>, "outcome": <"YES"|"NO">, "probability": <number 0.0-1.0> }
  ],
  "keyAssumptions": [<string>, <string>, <string>, <string>, <string>],
  "bullCase": <string: strongest argument for YES resolution, 2-3 sentences>,
  "bearCase": <string: strongest argument for NO resolution, 2-3 sentences>
}

historicalExamples must have exactly 3 items. keyAssumptions must have exactly 5 items.`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 })
  }

  const parsed = JSON.parse(jsonMatch[0])

  const brief = await prisma.forecastingBrief.create({
    data: {
      questionId,
      baseRateEstimate: parsed.baseRateEstimate,
      baseRateReasoning: parsed.baseRateReasoning,
      historicalExamples: parsed.historicalExamples,
      keyAssumptions: parsed.keyAssumptions,
      bullCase: parsed.bullCase,
      bearCase: parsed.bearCase,
      modelVersion: MODEL,
    },
  })

  return NextResponse.json(brief, { status: 201 })
}
