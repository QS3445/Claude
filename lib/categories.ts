export const CATEGORIES = {
  technology: { enum: "TECHNOLOGY" as const, label: "Technology", icon: "Cpu", color: "blue" },
  business: { enum: "BUSINESS" as const, label: "Business", icon: "TrendingUp", color: "green" },
  politics: { enum: "POLITICS" as const, label: "Politics", icon: "Landmark", color: "red" },
  science: { enum: "SCIENCE" as const, label: "Science", icon: "FlaskConical", color: "teal" },
  personal: { enum: "PERSONAL" as const, label: "Personal", icon: "User", color: "gray" },
} as const

export type CategorySlug = keyof typeof CATEGORIES

export function slugToEnum(slug: string): string | null {
  return CATEGORIES[slug as CategorySlug]?.enum ?? null
}

export function enumToSlug(enumValue: string): CategorySlug | null {
  const entry = Object.entries(CATEGORIES).find(([, v]) => v.enum === enumValue)
  return (entry?.[0] as CategorySlug) ?? null
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([slug, cat]) => ({
  value: cat.enum,
  label: cat.label,
  slug,
}))
