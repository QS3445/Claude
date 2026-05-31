import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database…")

  // Seed CategoryStats rows (one per category, all zeros to start)
  const categories = ["TECHNOLOGY", "BUSINESS", "POLITICS", "SCIENCE", "PERSONAL", "UNCATEGORIZED"] as const

  for (const category of categories) {
    await prisma.categoryStats.upsert({
      where: { category },
      create: { category, totalQuestions: 0, activeQuestions: 0, totalForecasts: 0 },
      update: {},
    })
  }

  console.log("CategoryStats rows created.")

  // Example seed user for local development only
  if (process.env.NODE_ENV !== "production") {
    const existingUser = await prisma.user.findFirst({ where: { email: "demo@example.com" } })

    if (!existingUser) {
      const user = await prisma.user.create({
        data: {
          id: "seed-user-01",
          name: "Demo User",
          email: "demo@example.com",
          emailVerified: true,
        },
      })

      await prisma.profile.create({
        data: {
          userId: user.id,
          username: "demouser",
          bio: "Seed user for local development",
          isPublic: true,
        },
      })

      const question = await prisma.question.create({
        data: {
          authorId: user.id,
          title: "Will there be a major AI safety incident reported publicly in 2025?",
          description:
            "A major AI safety incident is defined as an AI system causing measurable harm to at least 100 people, or causing economic damage exceeding $10M, that is publicly reported by a credible news organization.",
          resolutionCriteria:
            "Resolves YES if at least one credible news organization (NYT, BBC, Reuters, Washington Post, etc.) reports a verifiable incident meeting the definition above before January 1, 2026. Resolves NO otherwise. Resolves Ambiguous if reports are contested and no consensus emerges.",
          category: "TECHNOLOGY",
          status: "OPEN",
          visibility: "PUBLIC",
          deadline: new Date("2025-12-31T23:59:59Z"),
        },
      })

      await prisma.forecast.create({
        data: {
          questionId: question.id,
          userId: user.id,
          probability: 0.35,
          reasoning:
            "AI capabilities are advancing rapidly but most deployments still have meaningful human oversight. The base rate for novel-technology safety incidents in the first decade is moderate but the definition is quite specific.",
        },
      })

      console.log("Demo user, profile, question, and forecast created.")
    } else {
      console.log("Demo user already exists — skipping.")
    }
  }

  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
