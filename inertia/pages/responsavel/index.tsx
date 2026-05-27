import { useEffect, useState } from 'react'
import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ErrorBoundary } from 'react-error-boundary'
import { ResponsavelLayout } from '../../components/layouts'
import { DashboardOverviewContainer } from '../../containers/responsavel/dashboard-overview-container'
import { ResponsavelInsightsInbox } from '../../containers/responsavel/responsavel-insights-inbox'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { AlertCircle, BookOpen, DollarSign, Bell, FileText, CreditCard, Users, CheckCircle2 } from 'lucide-react'
import { EmptyState } from '../../components/ui/empty-state'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { SharedProps } from '../../lib/types'
import { useAuthUser } from '../../stores/auth_store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import type { Route } from '@tuyau/core/types'

type ResponsavelStatsResponse = Route.Response<'api.v1.dashboard.responsavel_stats'>

function ResponsavelContent() {
  const { url } = usePage<SharedProps>()
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.dashboard.responsavelStats.queryOptions({})
  )

  if (isLoading) {
    return <ResponsavelSkeleton />
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar dados: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return null
  }

  const stats = data as ResponsavelStatsResponse

  // Early return se não tiver filhos
  if (stats.students.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Nenhum aluno vinculado"
        description="Você não está vinculado a nenhum aluno no momento."
      />
    )
  }

  // ?aluno= carrega slug; resolva via slug, com fallback pro primeiro filho
  let alunoSlug: string | null = null
  try {
    const urlObj =
      typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(`http://localhost${url}`)
    alunoSlug = urlObj.searchParams.get('aluno')
  } catch {
    const match = url.match(/[?&]aluno=([^&]+)/)
    alunoSlug = match ? match[1] : null
  }

  const selectedStudent =
    (alunoSlug && stats.students.find((s) => s.slug === alunoSlug)) || stats.students[0]
  const studentId = selectedStudent?.id
  const hasPedagogical = selectedStudent?.permissions?.pedagogical || false
  const hasFinancial = selectedStudent?.permissions?.financial || false
  const availableDomains = [
    ...(hasPedagogical ? (['pedagogical', 'school-life'] as const) : []),
    ...(hasFinancial ? (['financial'] as const) : []),
  ]
  const defaultTab = availableDomains[0]

  if (!selectedStudent || !studentId) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aluno não encontrado. Por favor, selecione um aluno no menu acima.
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasPedagogical && !hasFinancial) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não possui permissões pedagógicas nem financeiras para este aluno.
        </AlertDescription>
      </Alert>
    )
  }

  // Layout 2-col espelhando o /escola: main esquerda com dashboard, aside
  // direita com a inbox de insights (sticky no topo, 320px). Em mobile
  // (lg-), inbox vem antes do dashboard via order-1/order-2.
  const main =
    availableDomains.length === 1 ? (
      <DashboardOverviewContainer studentId={studentId} mode={availableDomains[0]} />
    ) : (
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid md:grid-cols-3">
          {hasPedagogical && (
            <TabsTrigger value="pedagogical" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Pedagógico
            </TabsTrigger>
          )}
          {hasPedagogical && (
            <TabsTrigger value="school-life" className="gap-2">
              <Bell className="h-4 w-4" />
              Vida Escolar
            </TabsTrigger>
          )}
          {hasFinancial && (
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Financeiro
            </TabsTrigger>
          )}
        </TabsList>

        {hasPedagogical && (
          <TabsContent value="pedagogical" className="mt-6">
            <DashboardOverviewContainer studentId={studentId} mode="pedagogical" />
          </TabsContent>
        )}

        {hasPedagogical && (
          <TabsContent value="school-life" className="mt-6">
            <DashboardOverviewContainer studentId={studentId} mode="school-life" />
          </TabsContent>
        )}

        {hasFinancial && (
          <TabsContent value="financial" className="mt-6">
            <DashboardOverviewContainer studentId={studentId} mode="financial" />
          </TabsContent>
        )}
      </Tabs>
    )

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <aside className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
        <ResponsavelInsightsInbox studentId={studentId} />
      </aside>
      <div className="min-w-0 lg:order-1">{main}</div>
    </div>
  )
}

function PendingAcknowledgementBanner() {
  const { data } = useQuery(api.api.v1.responsavel.api.comunicados.pendingAck.queryOptions({}))

  const pendingCount = Array.isArray(data) ? data.length : 0

  if (pendingCount === 0) {
    return null
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Você possui {pendingCount} comunicado(s) aguardando ciência. Acesse{' '}
        <Link className="underline" href="/responsavel/comunicados">
          Comunicados
        </Link>{' '}
        para confirmar.
      </AlertDescription>
    </Alert>
  )
}

function ResponsavelSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-5 w-48 animate-pulse rounded bg-muted mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}

const ONBOARDING_STEPS = [
  {
    icon: FileText,
    title: 'Documentos',
    description: 'Envie os documentos solicitados pela escola pra matrícula.',
  },
  {
    icon: CreditCard,
    title: 'Pagamentos',
    description: 'Acompanhe mensalidades e faturas na aba Financeiro.',
  },
  {
    icon: BookOpen,
    title: 'Acompanhamento',
    description: 'Veja notas, frequência e atividades do seu filho.',
  },
  {
    icon: Bell,
    title: 'Comunicados',
    description: 'Fique por dentro dos avisos e eventos da escola.',
  },
]

function OnboardingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="z-[110] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Bem-vindo ao Anuá!</DialogTitle>
          <DialogDescription>
            Aqui você acompanha tudo sobre a vida escolar do seu filho. Veja como começar:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {ONBOARDING_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Entendi, vamos lá!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ResponsavelDashboard() {
  const user = useAuthUser()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!user) return
    const key = `anua:onboarding-seen:${user.id}`
    if (localStorage.getItem(key) !== '1') {
      setShowOnboarding(true)
    }
  }, [user])

  function handleDismissOnboarding() {
    setShowOnboarding(false)
    if (user) localStorage.setItem(`anua:onboarding-seen:${user.id}`, '1')
  }

  return (
    <ResponsavelLayout>
      <Head title="Início" />

      <OnboardingModal open={showOnboarding} onClose={handleDismissOnboarding} />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus filhos</p>
        </div>

        <PendingAcknowledgementBanner />

        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro inesperado: {(error as Error).message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <ResponsavelContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
