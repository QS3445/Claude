"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORY_OPTIONS } from "@/lib/categories"

export default function NewQuestionPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    description: "",
    resolutionCriteria: "",
    category: "UNCATEGORIZED",
    visibility: "PRIVATE",
    deadline: "",
  })

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(status: "DRAFT" | "OPEN") {
    startTransition(async () => {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(JSON.stringify(data.error))
        return
      }

      const question = await res.json()

      if (status === "OPEN") {
        await fetch(`/api/questions/${question.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "OPEN" }),
        })
      }

      router.push(`/questions/${question.id}`)
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Question</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Question Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Will X happen by Y date?"
              value={form.title}
              onChange={set("title")}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Background & Context</Label>
            <Textarea
              id="description"
              placeholder="Provide context for this question…"
              value={form.description}
              onChange={set("description")}
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="resolutionCriteria">
              Resolution Criteria <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="resolutionCriteria"
              placeholder="This question resolves YES if… It resolves NO if… It resolves Ambiguous if…"
              value={form.resolutionCriteria}
              onChange={set("resolutionCriteria")}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Be explicit. Vague criteria lead to disputes and ambiguous resolutions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Visibility</Label>
              <Select
                value={form.visibility}
                onValueChange={(v) => setForm((f) => ({ ...f, visibility: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                  <SelectItem value="UNLISTED">Unlisted (link only)</SelectItem>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="deadline">Resolution Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={set("deadline")}
            />
            <p className="text-xs text-muted-foreground">
              When forecasting closes. Question can still be resolved manually before this date.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleSubmit("OPEN")}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? "Creating…" : "Create & Open"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit("DRAFT")}
              disabled={isPending}
            >
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
