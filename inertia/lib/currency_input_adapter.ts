export function centsToReaisNumber(cents: number): number {
  return cents / 100
}

export function reaisNumberToCents(reais: number): number {
  return Math.round(reais * 100)
}

export function reaisStringToCents(value: string | null | undefined): number {
  if (!value) return 0
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return reaisNumberToCents(parsed)
}

export function centsToReaisString(cents: number): string {
  return String(centsToReaisNumber(cents))
}
