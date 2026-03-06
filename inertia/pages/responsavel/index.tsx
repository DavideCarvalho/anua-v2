import { Head, usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ErrorBoundary } from 'react-error-boundary'
import { ResponsavelLayout } from '../../components/layouts'
import { DashboardOverviewContainer } from '../../containers/responsavel/dashboard-overview-container'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { SharedProps } from '../../lib/types'
import { useAuthUser } from '../../stores/auth_store'

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

  // Early return se não tiver filhos
  if (data.students.length === 0) {
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
  alunoId = alunoId || data.students[0]?.id

  // Buscar studentId
  const studentId = data.students.find((s) => s.id === alunoId)?.id || data.students[0]?.id

  // Se não tiver studentId válido, mostrar aviso
  if (!studentId || !data.students.some((s) => s.id === studentId)) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Aluno não encontrado. Por favor, selecione um aluno no menu acima.
        </AlertDescription>
      </Alert>
    )
  }

  return <DashboardOverviewContainer studentId={studentId} />
}

function PendingAcknowledgementBanner() {
  const { data } = useQuery({
    queryKey: ['responsavel-pending-ack'],
    queryFn: async () => {
      const response = await fetch('/api/v1/responsavel/comunicados/pending-ack', {
        credentials: 'include',
      })

      if (!response.ok) {
        return { data: [] as Array<{ id: string }> }
      }

      return (await response.json()) as { data: Array<{ id: string }> }
    },
  })

  const pendingCount = data?.data?.length ?? 0

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
