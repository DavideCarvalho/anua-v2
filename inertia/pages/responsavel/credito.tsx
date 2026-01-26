import { Head, usePage } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertCircle, Wallet } from 'lucide-react'
import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { BalanceOverviewContainer } from '../../containers/responsavel/balance-overview-container'
import { TransactionsHistoryContainer } from '../../containers/responsavel/transactions-history-container'
import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import type { SharedProps } from '../../lib/types'

function CreditoContent() {
  const { url } = usePage<SharedProps>()
  const { data, isLoading, isError, error } = useQuery(useResponsavelStatsQueryOptions())

  if (isLoading) {
    return <CreditoSkeleton />
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
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Nenhum aluno vinculado</AlertDescription>
      </Alert>
    )
  }

  // Pegar studentId dos query params ou usar primeiro filho
  let alunoId: string | null = null
  try {
    const urlObj = typeof window !== 'undefined'
      ? new URL(url, window.location.origin)
      : new URL(`http://localhost${url}`)
    alunoId = urlObj.searchParams.get('aluno')
  } catch {
    // Fallback if URL parsing fails
    const match = url.match(/[?&]aluno=([^&]+)/)
    alunoId = match ? match[1] : null
  }

  // Buscar studentId
  const studentId = data.students.find((s) => s.id === alunoId)?.id || data.students[0]?.id
  const selectedStudent = data.students.find((s) => s.id === studentId)

  // Se não tiver studentId válido, mostrar aviso
  if (!studentId || !selectedStudent) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Aluno não encontrado</AlertDescription>
      </Alert>
    )
  }

  // Verificar permissão financeira
  if (!selectedStudent.permissions?.financial) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão financeira para gerenciar o saldo deste aluno. Entre em contato
          com a secretaria da escola.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <BalanceOverviewContainer studentId={studentId} />

      {/* Transactions History */}
      <TransactionsHistoryContainer studentId={studentId} />
    </div>
  )
}

function CreditoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CreditoPage() {
  return (
    <ResponsavelLayout>
      <Head title="Crédito e Saldo" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Crédito e Saldo
          </h1>
          <p className="text-muted-foreground">Gerencie o saldo do aluno</p>
        </div>

        {/* Content */}
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro inesperado: {error.message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <CreditoContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
