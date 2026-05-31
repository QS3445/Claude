import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MIN_RESOLVED = 10

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const rows = await prisma.$queryRaw<
    Array<{
      userId: string
      name: string
      username: string | null
      avg_brier: number
      resolved_count: number
      total_forecasts: number
    }>
  >`
    SELECT
      u.id as "userId",
      u.name,
      p.username,
      AVG(CAST(s."brierScore" AS FLOAT)) as avg_brier,
      COUNT(s.id)::int as resolved_count,
      COUNT(DISTINCT f.id)::int as total_forecasts
    FROM "user" u
    JOIN score s ON s."userId" = u.id
    JOIN forecast f ON f."userId" = u.id
    LEFT JOIN profile p ON p."userId" = u.id
    WHERE (p."isPublic" = true OR u.id = ${session.user.id})
    GROUP BY u.id, u.name, p.username
    HAVING COUNT(s.id) >= ${MIN_RESOLVED}
    ORDER BY avg_brier ASC
    LIMIT 50
  `

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ranked by average Brier score. Minimum {MIN_RESOLVED} resolved questions required.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No ranked forecasters yet.</p>
          <p className="text-sm mt-1">Resolve {MIN_RESOLVED} questions to appear here.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-12">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Forecaster</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Brier Score</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Resolved</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Forecasts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isCurrentUser = row.userId === session.user.id
                return (
                  <tr
                    key={row.userId}
                    className={`border-t ${isCurrentUser ? "bg-primary/5 font-medium" : "hover:bg-muted/50"}`}
                  >
                    <td className="px-4 py-3 tabular-nums">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span>{row.name}</span>
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-primary">(you)</span>
                        )}
                        {row.username && (
                          <span className="block text-xs text-muted-foreground">@{row.username}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-mono">
                      {Number(row.avg_brier).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                      {row.resolved_count}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">
                      {row.total_forecasts}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
