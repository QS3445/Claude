"use client"

import { useState, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

type ResolutionOption = "YES" | "NO" | "AMBIGUOUS"

export default function ResolvePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [resolution, setResolution] = useState<ResolutionOption | "">("")
  const [resolutionNote, setResolutionNote] = useState("")
  const [sources, setSources] = useState([{ url: "", title: "", excerpt: "" }])
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function addSource() {
    setSources((s) => [...s, { url: "", title: "", excerpt: "" }])
  }

  function removeSource(i: number) {
    setSources((s) => s.filter((_, idx) => idx !== i))
  }

  function updateSource(i: number, field: string, value: string) {
    setSources((s) => s.map((src, idx) => (idx === i ? { ...src, [field]: value } : src)))
  }

  function handleSubmit() {
    if (!resolution) { setError("Please select a resolution."); return }
    if (resolutionNote.trim().length < 10) { setError("Please explain the resolution."); return }

    startTransition(async () => {
      const res = await fetch(`/api/questions/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resolution,
          resolutionNote,
          sources: sources.filter((s) => s.url.trim()),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(JSON.stringify(data.error))
        return
      }

      router.push(`/questions/${id}`)
      router.refresh()
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Resolve Question</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Outcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(["YES", "NO", "AMBIGUOUS"] as ResolutionOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setResolution(opt)}
                className={`rounded-md border p-3 text-sm font-medium transition-colors ${
                  resolution === opt
                    ? opt === "YES"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : opt === "NO"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-500 bg-gray-50 text-gray-700"
                    : "hover:bg-muted"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <Label>Resolution Notes</Label>
            <Textarea
              placeholder="Explain what happened and why this outcome is correct."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sources</Label>
              <Button variant="ghost" size="sm" onClick={addSource} type="button">
                <Plus className="h-3.5 w-3.5" /> Add source
              </Button>
            </div>
            {sources.map((src, i) => (
              <div key={i} className="space-y-2 rounded-md border p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="URL"
                    value={src.url}
                    onChange={(e) => updateSource(i, "url", e.target.value)}
                    className="flex-1"
                  />
                  {sources.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeSource(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Source title"
                  value={src.title}
                  onChange={(e) => updateSource(i, "title", e.target.value)}
                />
                <Textarea
                  placeholder="Relevant excerpt (optional but recommended)"
                  value={src.excerpt}
                  onChange={(e) => updateSource(i, "excerpt", e.target.value)}
                  rows={2}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
              {isPending ? "Resolving…" : "Confirm Resolution"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
