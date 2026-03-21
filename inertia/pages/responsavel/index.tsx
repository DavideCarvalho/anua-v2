import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ErrorBoundary } from 'react-error-boundary'
import { ResponsavelLayout } from '../../components/layouts'
import { DashboardOverviewContainer } from '../../containers/responsavel/dashboard-overview-container'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle, BookOpen, DollarSign, Bell } from 'lucide-react'
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
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Você não está vinculado a nenhum aluno no momento.
        </p>
      </div>
    )
  }

  // Pegar studentId dos query params ou usar primeiro filho
  let alunoId: string | null = null
  try {
    const urlObj =
      typeof window !== 'undefined'
        ? new URL(url, window.location.origin)
        : new URL(`http://localhost${url}`)
    alunoId = urlObj.searchParams.get('aluno')
  } catch {
    const match = url.match(/[?&]aluno=([^&]+)/)
    alunoId = match ? match[1] : null
  }
  alunoId = alunoId || stats.students[0]?.id

  // Buscar studentId e permissões
  const selectedStudent = stats.students.find((s) => s.id === alunoId) || stats.students[0]
  const studentId = selectedStudent?.id
  const hasPedagogical = selectedStudent?.permissions?.pedagogical || false
  const hasFinancial = selectedStudent?.permissions?.financial || false
  const availableDomains = [
    ...(hasPedagogical ? (['pedagogical', 'school-life'] as const) : []),
    ...(hasFinancial ? (['financial'] as const) : []),
  ]
  const defaultTab = availableDomains[0]

  // Se não tiver studentId válido, mostrar aviso
  if (!studentId || !stats.students.some((s) => s.id === studentId)) {
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

  if (availableDomains.length === 1) {
    return <DashboardOverviewContainer studentId={studentId} mode={availableDomains[0]} />
  }

  return (
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

export default function ResponsavelDashboard() {
  const user = useAuthUser()

  return (
    <ResponsavelLayout>
      <Head title="Início" />

      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus filhos</p>
        </div>

        <PendingAcknowledgementBanner />

        {/* Dashboard Overview */}
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
