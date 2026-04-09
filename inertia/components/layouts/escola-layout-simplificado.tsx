import type { PropsWithChildren } from 'react'
import { Link } from '@adonisjs/inertia/react'

import type { EscolaDashboardViewMode } from '../../lib/escola-dashboard-view-mode'
import { ImpersonationBanner } from '../admin/impersonation-banner'
import { Button } from '../ui/button'

type EscolaLayoutSimplificadoProps = PropsWithChildren<{
  title: string
  viewMode: EscolaDashboardViewMode
  onViewModeChange: (mode: EscolaDashboardViewMode) => void
}>

export function EscolaLayoutSimplificado({
  title,
  viewMode,
  onViewModeChange,
  children,
}: EscolaLayoutSimplificadoProps) {
  return (
    <div data-testid="escola-simplified-layout" className="min-h-screen bg-background">
      <ImpersonationBanner />

      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/escola">
              <Button type="button" size="sm" variant="outline">
                Menu
              </Button>
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'full' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('full')}
            >
              Visão completa
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'simple' ? 'default' : 'outline'}
              onClick={() => onViewModeChange('simple')}
            >
              Visão simplificada
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-5">{children}</main>
    </div>
  )
}
