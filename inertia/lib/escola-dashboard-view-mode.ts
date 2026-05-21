export type EscolaDashboardViewMode = 'full' | 'simple'

const DASHBOARD_VIEW_MODE_STORAGE_KEY_PREFIX = 'escola:dashboard:view-mode'
const DASHBOARD_FILTERS_STORAGE_KEY_PREFIX = 'escola:dashboard:filters'

export function getEscolaDashboardViewModeKey(userId?: string | null): string | null {
  if (!userId) return null
  return `${DASHBOARD_VIEW_MODE_STORAGE_KEY_PREFIX}:${userId}`
}

export function readEscolaDashboardViewMode(userId?: string | null): EscolaDashboardViewMode {
  if (typeof window === 'undefined') return 'full'

  const key = getEscolaDashboardViewModeKey(userId)
  if (!key) return 'full'

  const rawValue = window.localStorage.getItem(key)
  return rawValue === 'simple' ? 'simple' : 'full'
}

export function writeEscolaDashboardViewMode(
  userId: string | null | undefined,
  mode: EscolaDashboardViewMode
): void {
  if (typeof window === 'undefined') return

  const key = getEscolaDashboardViewModeKey(userId)
  if (!key) return

  window.localStorage.setItem(key, mode)
}

export type EscolaDashboardPersistedFilters = {
  academicPeriodId: string
  courseId: string
  levelId: string
  classId: string
  subPeriodId: string
}

// Bucket único por usuário. O estado completo (incluindo academicPeriodId)
// fica no payload — quando o user troca de período e recarrega, volta no
// mesmo período. Versão anterior tinha bucket por academicPeriodId, mas no
// boot o filter inicial era 'all', então a hidratação só lia o bucket 'all'
// e o período selecionado se perdia.
export function getEscolaDashboardFiltersKey(
  userId: string | null | undefined
): string | null {
  if (!userId) return null
  return `${DASHBOARD_FILTERS_STORAGE_KEY_PREFIX}:${userId}`
}

export function readEscolaDashboardFilters(
  userId: string | null | undefined
): EscolaDashboardPersistedFilters | null {
  if (typeof window === 'undefined') return null

  const key = getEscolaDashboardFiltersKey(userId)
  if (!key) return null

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) return null

  try {
    // Padrão da casa (cf. inertia/components/ai/ai-action-canvas.tsx): parse
    // implícito + typeof checks campo a campo, sem cast nem `unknown`.
    const parsed = JSON.parse(rawValue)
    if (
      typeof parsed?.academicPeriodId === 'string' &&
      typeof parsed?.courseId === 'string' &&
      typeof parsed?.levelId === 'string' &&
      typeof parsed?.classId === 'string' &&
      typeof parsed?.subPeriodId === 'string'
    ) {
      return {
        academicPeriodId: parsed.academicPeriodId,
        courseId: parsed.courseId,
        levelId: parsed.levelId,
        classId: parsed.classId,
        subPeriodId: parsed.subPeriodId,
      }
    }
    return null
  } catch {
    return null
  }
}

export function writeEscolaDashboardFilters(
  userId: string | null | undefined,
  filters: EscolaDashboardPersistedFilters
): void {
  if (typeof window === 'undefined') return

  const key = getEscolaDashboardFiltersKey(userId)
  if (!key) return

  window.localStorage.setItem(key, JSON.stringify(filters))
}
