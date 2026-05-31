import { describe, it, expect } from "vitest"
import {
  createQuestionSchema,
  createForecastSchema,
  resolveQuestionSchema,
} from "@/lib/validations"

describe("createQuestionSchema", () => {
  const valid = {
    title: "Will the US GDP grow in Q3 2025?",
    description: "This tracks whether the US economy shows positive GDP growth.",
    resolutionCriteria: "Resolves YES if BEA reports positive GDP growth for Q3 2025.",
    category: "BUSINESS" as const,
    visibility: "PUBLIC" as const,
  }

  it("accepts a valid question", () => {
    expect(createQuestionSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects a title that is too short", () => {
    const result = createQuestionSchema.safeParse({ ...valid, title: "Short?" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid category", () => {
    const result = createQuestionSchema.safeParse({ ...valid, category: "SPORTS" })
    expect(result.success).toBe(false)
  })

  it("accepts null deadline", () => {
    const result = createQuestionSchema.safeParse({ ...valid, deadline: null })
    expect(result.success).toBe(true)
  })
})

describe("createForecastSchema", () => {
  it("accepts probability 1–99", () => {
    expect(createForecastSchema.safeParse({ probability: 50, reasoning: "Valid reasoning text" }).success).toBe(true)
    expect(createForecastSchema.safeParse({ probability: 1, reasoning: "Valid reasoning text" }).success).toBe(true)
    expect(createForecastSchema.safeParse({ probability: 99, reasoning: "Valid reasoning text" }).success).toBe(true)
  })

  it("rejects probability 0 and 100", () => {
    expect(createForecastSchema.safeParse({ probability: 0, reasoning: "Valid reasoning text" }).success).toBe(false)
    expect(createForecastSchema.safeParse({ probability: 100, reasoning: "Valid reasoning text" }).success).toBe(false)
  })

  it("rejects short reasoning", () => {
    expect(createForecastSchema.safeParse({ probability: 50, reasoning: "Short" }).success).toBe(false)
  })
})

describe("resolveQuestionSchema", () => {
  it("accepts valid YES resolution with source", () => {
    const result = resolveQuestionSchema.safeParse({
      resolution: "YES",
      resolutionNote: "The event clearly occurred as reported by multiple outlets.",
      sources: [{ url: "https://example.com/article", title: "Article Title" }],
    })
    expect(result.success).toBe(true)
  })

  it("accepts AMBIGUOUS resolution without sources", () => {
    const result = resolveQuestionSchema.safeParse({
      resolution: "AMBIGUOUS",
      resolutionNote: "The outcome was genuinely unclear and contested.",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid resolution", () => {
    const result = resolveQuestionSchema.safeParse({
      resolution: "MAYBE",
      resolutionNote: "Some resolution note here.",
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid URL in sources", () => {
    const result = resolveQuestionSchema.safeParse({
      resolution: "YES",
      resolutionNote: "Resolution note that is long enough.",
      sources: [{ url: "not-a-url", title: "Bad source" }],
    })
    expect(result.success).toBe(false)
  })
})
