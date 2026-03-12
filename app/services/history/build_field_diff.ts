export type FieldDiff = {
  field: string
  oldValue: unknown
  newValue: unknown
}

type ComparableSnapshot = Record<string, unknown>

function normalizeValue(value: unknown): unknown {
  if (value === undefined) {
    return null
  }

  return value
}

export function buildFieldDiff(
  before: ComparableSnapshot,
  after: ComparableSnapshot,
  fields: string[]
): FieldDiff[] {
  return fields.flatMap((field) => {
    const oldValue = normalizeValue(before[field])
    const newValue = normalizeValue(after[field])

    if (oldValue === newValue) {
      return []
    }

    return [{ field, oldValue, newValue }]
  })
}
