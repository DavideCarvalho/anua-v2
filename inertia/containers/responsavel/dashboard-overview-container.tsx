import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import {
  User,
  Calendar,
  CreditCard,
  ShoppingCart,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useStudentOverviewQueryOptions } from '../../hooks/queries/use_student_overview'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DashboardOverviewContent({ studentId }: { studentId: string }) {
  const { data: overview, isLoading, isError, error } = useQuery(useStudentOverviewQueryOptions(studentId))

  if (isLoading) {
    return <DashboardOverviewSkeleton />
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

  if (!overview) {
    return null
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Student Info */}
      {overview.student && (
        <div>
          <h2 className="text-2xl font-bold">{overview.student.name}</h2>
          {overview.student.school && (
            <p className="text-sm text-muted-foreground">{overview.student.school}</p>
          )}
          {/* Permission Badges */}
          <div className="mt-2 flex gap-2">
            {overview.permissions.pedagogical && (
              <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-800">
                Acesso Pedagógico
              </span>
            )}
            {overview.permissions.financial && (
              <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-800">
                Acesso Financeiro
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Frequência - Só se tiver permissão pedagógica */}
        {overview.permissions.pedagogical && overview.pedagogical && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.pedagogical.attendance.percentage}%
              </div>
              <Progress
                value={overview.pedagogical.attendance.percentage}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {overview.pedagogical.attendance.presentDays} de{' '}
                {overview.pedagogical.attendance.totalDays} dias
              </p>
            </CardContent>
          </Card>
        )}

        {/* Próxima Tarefa */}
        {overview.permissions.pedagogical && overview.pedagogical && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Tarefa</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overview.pedagogical.upcomingAssignments.length > 0 ? (
                <>
                  <div className="text-sm font-bold">
                    {overview.pedagogical.upcomingAssignments[0]!.title}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {overview.pedagogical.upcomingAssignments[0]!.subject}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Entrega: {formatDate(overview.pedagogical.upcomingAssignments[0]!.dueDate)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mensalidades Pendentes */}
        {overview.permissions.financial && overview.financial && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensalidades Pendentes</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overview.financial.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {overview.financial.recentPayments.filter(
                  (p) => p.status === 'PENDING' || p.status === 'OVERDUE'
                ).length}{' '}
                mensalidade(s)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Saldo Cantina */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Cantina</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.canteen.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo disponível</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com conteúdo detalhado */}
      <Tabs defaultValue="grades" className="w-full">
        <TabsList>
          {overview.permissions.pedagogical && (
            <>
              <TabsTrigger value="grades">Notas Recentes</TabsTrigger>
              <TabsTrigger value="assignments">Tarefas</TabsTrigger>
            </>
          )}
          {overview.permissions.financial && (
            <TabsTrigger value="payments">Mensalidades</TabsTrigger>
          )}
        </TabsList>

        {/* Tab de Notas */}
        {overview.permissions.pedagogical && overview.pedagogical && (
          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Notas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.pedagogical.recentGrades.length > 0 ? (
                  <div className="space-y-3">
                    {overview.pedagogical.recentGrades.map((grade: { subject: string; assignmentTitle: string; grade: number; maxGrade: number }, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {grade.assignmentTitle}
                          </p>
                        </div>
                        <Badge
                          variant={
                            grade.grade && grade.maxGrade
                              ? (grade.grade ?? 0) >= (grade.maxGrade ?? 0) * 0.7
                                ? 'default'
                                : 'destructive'
                              : 'secondary'
                          }
                        >
                          {grade.grade?.toFixed(1) || '-'} / {grade.maxGrade || '-'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Nenhuma nota disponível ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tab de Tarefas */}
        {overview.permissions.pedagogical && overview.pedagogical && (
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Tarefas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.pedagogical.upcomingAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {overview.pedagogical.upcomingAssignments.map((assignment: { id: string; title: string; subject: string; dueDate: string }) => (
                      <div
                        key={assignment.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div className="flex-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">{assignment.subject}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {formatDate(assignment.dueDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Nenhuma tarefa pendente!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tab de Mensalidades */}
        {overview.permissions.financial && overview.financial && (
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Mensalidades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.financial.recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {overview.financial.recentPayments.slice(0, 5).map((payment) => {
                      const statusConfig: Record<
                        string,
                        { label: string; variant: 'default' | 'destructive' | 'secondary' }
                      > = {
                        PAID: { label: 'Pago', variant: 'default' },
                        PENDING: { label: 'Pendente', variant: 'secondary' },
                        OVERDUE: { label: 'Atrasado', variant: 'destructive' },
                      }

                      const config = statusConfig[payment.status] ?? {
                        label: payment.status,
                        variant: 'secondary' as const,
                      }

                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{payment.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Vencimento: {formatDate(String(payment.dueDate))}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(payment.value)}</p>
                            <Badge variant={config.variant} className="mt-1">
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    Nenhuma mensalidade encontrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export function DashboardOverviewContainer({ studentId }: { studentId: string }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar dados: {(error as Error).message}
                <button onClick={resetErrorBoundary} className="ml-2 underline">
                  Tentar novamente
                </button>
              </AlertDescription>
            </Alert>
          )}
        >
          <DashboardOverviewContent studentId={studentId} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
