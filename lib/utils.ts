import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function formatBrier(score: number): string {
  return score.toFixed(3)
}

export function probabilityToPercent(p: number): number {
  return Math.round(p * 100)
}

export function percentToProbability(pct: number): number {
  return Math.max(0.0001, Math.min(0.9999, pct / 100))
}

export function clampProbability(p: number): number {
  return Math.max(0.0001, Math.min(0.9999, p))
}
