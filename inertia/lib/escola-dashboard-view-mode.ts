export type EscolaDashboardViewMode = 'full' | 'simple'

const DASHBOARD_VIEW_MODE_STORAGE_KEY_PREFIX = 'escola:dashboard:view-mode'

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
