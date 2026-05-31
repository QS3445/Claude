import { z } from "zod"

export const createQuestionSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  resolutionCriteria: z
    .string()
    .min(20, "Resolution criteria must be at least 20 characters")
    .max(1000),
  category: z.enum(["TECHNOLOGY", "BUSINESS", "POLITICS", "SCIENCE", "PERSONAL", "UNCATEGORIZED"]),
  visibility: z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]).default("PRIVATE"),
  deadline: z.string().datetime().optional().nullable(),
})

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  status: z.enum(["DRAFT", "OPEN"]).optional(),
})

export const createForecastSchema = z.object({
  probability: z
    .number()
    .min(1, "Minimum 1%")
    .max(99, "Maximum 99%")
    .int("Must be a whole number"),
  reasoning: z.string().min(10, "Please provide at least 10 characters of reasoning").max(5000),
})

export const resolveQuestionSchema = z.object({
  resolution: z.enum(["YES", "NO", "AMBIGUOUS"]),
  resolutionNote: z.string().min(10, "Please explain the resolution").max(2000),
  sources: z
    .array(
      z.object({
        url: z.string().url("Must be a valid URL"),
        title: z.string().min(1).max(300),
        excerpt: z.string().max(1000).optional(),
      })
    )
    .optional(),
})

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>
export type CreateForecastInput = z.infer<typeof createForecastSchema>
export type ResolveQuestionInput = z.infer<typeof resolveQuestionSchema>
