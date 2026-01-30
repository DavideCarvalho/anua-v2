import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertCircle, Wallet } from 'lucide-react'
import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { BalanceOverviewContainer } from '../../containers/responsavel/balance-overview-container'
import { TransactionsHistoryContainer } from '../../containers/responsavel/transactions-history-container'
import { useSelectedStudent } from '../../hooks/use_selected_student'

function NoStudentCard() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno selecionado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um aluno no menu acima para ver o saldo
        </p>
      </CardContent>
    </Card>
  )
}

function NoFinancialPermissionCard() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Voce nao tem permissao financeira para gerenciar o saldo deste aluno. Entre em contato
        com a secretaria da escola.
      </AlertDescription>
    </Alert>
  )
}

function CreditoContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <CreditoSkeleton />
  }

  if (!student) {
    return <NoStudentCard />
  }

  // Verificar permissão financeira
  if (!student.permissions?.financial) {
    return <NoFinancialPermissionCard />
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <BalanceOverviewContainer studentId={student.id} />

      {/* Transactions History */}
      <TransactionsHistoryContainer studentId={student.id} />
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
                Erro inesperado: {(error as Error).message}
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
