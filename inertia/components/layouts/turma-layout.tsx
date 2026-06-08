import { useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Sparkles } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/utils'
import type { SharedProps } from '../../lib/types'
import { Button } from '../ui/button'
import { AskAnuaPanel, AskAnuaSheet } from '../../containers/ai/ask-anua-sheet'
import { useAuthUser } from '../../stores/auth_store'
import { useIsMobile } from '../../hooks/use_mobile'
import { useTurmaAskAnuaContext, type TurmaScreenId } from '../../lib/ask-anua-context'
import { EscolaLayout } from './escola-layout'

interface TurmaLayoutProps extends PropsWithChildren {
  turmaName: string
  courseName: string
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  // Contexto pro "Perguntar ao Anuá". screenId muda por tab; classId/courseId/
  // academicPeriodId vão pro screen.filters como hint pra o persona ("essa
  // turma" referencia o classId).
  screenId: TurmaScreenId
  classId: string
  courseId: string
  academicPeriodId: string
}

const tabs = [
  { label: 'Atividades', path: 'atividades' },
  { label: 'Provas', path: 'provas' },
  { label: 'Presenças', path: 'presencas' },
  { label: 'Notas', path: 'notas' },
  { label: 'Situação', path: 'situacao' },
]

// Mesmo gate do dashboard (canViewFinancialTab) — quem hoje vê os dados
// estratégicos da escola. Quando ampliarmos pra professor/coordenador, mover
// pra uma função utilitária compartilhada.
const ASK_ANUA_ROLES = new Set(['SCHOOL_ADMIN', 'SCHOOL_CHAIN_DIRECTOR', 'SCHOOL_DIRECTOR'])

export function TurmaLayout({
  children,
  turmaName,
  courseName,
  academicPeriodSlug,
  courseSlug,
  classSlug,
  screenId,
  classId,
  courseId,
  academicPeriodId,
}: TurmaLayoutProps) {
  const { url } = usePage<SharedProps>()
  const user = useAuthUser()
  const isMobile = useIsMobile()
  const [isAskAnuaOpen, setIsAskAnuaOpen] = useState(false)

  const roleName = user?.role?.name
  const canUseAskAnua = Boolean(roleName && ASK_ANUA_ROLES.has(roleName))

  const pathname = url.split('?')[0]
  const baseUrl = `/escola/periodos-letivos/${academicPeriodSlug}/cursos/${courseSlug}/turmas/${classSlug}`

  const askAnuaContext = useTurmaAskAnuaContext({
    screenId,
    classId,
    courseId,
    academicPeriodId,
    className: turmaName,
  })

  const askAnuaSheet = canUseAskAnua ? (
    <AskAnuaSheet open={isAskAnuaOpen} onOpenChange={setIsAskAnuaOpen} {...askAnuaContext} />
  ) : null

  const askAnuaInline =
    canUseAskAnua && !isMobile && isAskAnuaOpen ? (
      <AskAnuaPanel {...askAnuaContext} onClose={() => setIsAskAnuaOpen(false)} />
    ) : null

  const topbarActions = canUseAskAnua ? (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setIsAskAnuaOpen(true)}
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Perguntar ao Anuá</span>
      <span className="sr-only sm:hidden">Perguntar ao Anuá</span>
    </Button>
  ) : null

  return (
    <EscolaLayout topbarActions={topbarActions} rightPane={askAnuaInline}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{turmaName}</h1>
          <p className="text-muted-foreground">{courseName}</p>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const tabUrl = `${baseUrl}/${tab.path}`
              const isActive = pathname === tabUrl

              return (
                <Link
                  key={tab.path}
                  href={tabUrl}
                  className={cn(
                    'whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
      {/* Sheet só no mobile — em desktop, painel inline via rightPane.
          Renderizar os dois ao mesmo tempo abre overlay por cima do split. */}
      {isMobile ? askAnuaSheet : null}
    </EscolaLayout>
  )
}
