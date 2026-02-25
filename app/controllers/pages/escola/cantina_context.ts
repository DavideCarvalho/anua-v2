import db from '@adonisjs/lucid/services/db'

interface ResolveContextOptions {
  selectedSchoolIds?: string[]
  preferredCanteenId?: string | null
}

export async function resolveEscolaCanteenContext({
  selectedSchoolIds,
  preferredCanteenId,
}: ResolveContextOptions) {
  if (!selectedSchoolIds || selectedSchoolIds.length === 0) {
    return { canteenId: null, canteens: [] as Array<Record<string, unknown>> }
  }

  const canteens = await db
    .from('Canteen')
    .select('id', 'name', 'schoolId', 'responsibleUserId', 'createdAt')
    .whereIn('schoolId', selectedSchoolIds)
    .orderBy('createdAt', 'desc')
  const preferred = preferredCanteenId
    ? canteens.find((canteen) => canteen.id === preferredCanteenId)
    : null
  const activeCanteen = preferred ?? canteens[0] ?? null

  return {
    canteenId: activeCanteen?.id ?? null,
    canteens,
  }
}
