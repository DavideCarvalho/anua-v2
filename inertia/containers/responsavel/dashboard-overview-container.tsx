import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import {
  User,
  Calendar,
  CreditCard,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'
import { api } from '~/lib/api'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '~/components/ui/chart'
import type { Route } from '@tuyau/core/types'

type DashboardOverviewMode = 'pedagogical' | 'school-life' | 'financial'
type StudentOverviewResponse = Route.Response<'api.v1.responsavel.api.student_overview'>
type PedagogicalGrade = NonNullable<StudentOverviewResponse['pedagogical']>['recentGrades'][number]
type StudentInvoicesResponse = Route.Response<'api.v1.responsavel.api.student_invoices'>
type StudentInvoice = StudentInvoicesResponse['data'][number]

const pedagogicalChartConfig = {
  grade: { label: 'Nota', color: 'var(--chart-1)' },
  attendance: { label: 'Frequência', color: 'var(--chart-2)' },
} satisfies ChartConfig

const schoolLifeChartConfig = {
  value: { label: 'Quantidade', color: 'var(--chart-3)' },
} satisfies ChartConfig

const financialChartConfig = {
  value: { label: 'Valor', color: 'var(--chart-4)' },
} satisfies ChartConfig

const intelligenceToneClass = {
  danger: 'border-l-destructive bg-destructive/10',
  warning: 'border-l-chart-4 bg-chart-4/10',
  info: 'border-l-chart-1 bg-chart-1/10',
} as const

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

function DashboardOverviewContent({
  studentId,
  mode,
}: {
  studentId: string
  mode: DashboardOverviewMode
}) {
  const {
    data: overview,
    isLoading,
    isError,
    error,
  } = useQuery(api.api.v1.responsavel.api.studentOverview.queryOptions({ params: { studentId } }))

  const { data: pendingAck } = useQuery({
    ...api.api.v1.responsavel.api.comunicados.pendingAck.queryOptions({}),
    enabled: mode === 'school-life',
  })

  const { data: occurrences } = useQuery(
    api.api.v1.responsavel.api.studentOccurrences.queryOptions({
      params: { studentId },
    })
  )
  const { data: calendar } = useQuery(
    api.api.v1.responsavel.api.studentCalendar.queryOptions({
      params: { studentId },
    })
  )

  const { data: invoicesData } = useQuery(
    api.api.v1.responsavel.api.studentInvoices.queryOptions({ params: { studentId } })
  )

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

  const overviewData = overview as StudentOverviewResponse
  const canShowPedagogical = overviewData.permissions.pedagogical && !!overviewData.pedagogical
  const canShowFinancial = overviewData.permissions.financial && !!overviewData.financial
  const pedagogical = overviewData.pedagogical
  const financial = overviewData.financial

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const renderStudentInfo = (
    <div>
      <h2 className="text-2xl font-bold">{overviewData.student.name}</h2>
      {overviewData.student.school ? (
        <p className="text-sm text-muted-foreground">{overviewData.student.school}</p>
      ) : null}
    </div>
  )

  if (mode === 'pedagogical' && canShowPedagogical) {
    const lowAttendance = pedagogical!.attendance.percentage < 75
    const pendingAssignments = pedagogical!.upcomingAssignments.length
    const lowGrades = pedagogical!.recentGrades.filter((grade: PedagogicalGrade) => {
      if (!grade.grade || !grade.maxGrade) return false
      return grade.grade < grade.maxGrade * 0.7
    }).length

    const gradeChartData = pedagogical!.recentGrades
      .slice(0, 5)
      .map((grade: PedagogicalGrade, index: number) => ({
        label: grade.subject?.slice(0, 8) || `Nota ${index + 1}`,
        grade: Number(grade.grade || 0),
      }))
    const attendanceChartData = [
      { label: 'Frequência', attendance: pedagogical!.attendance.percentage },
    ]

    return (
      <div className="space-y-6">
        {renderStudentInfo}

        <div className="grid gap-4 md:grid-cols-3">
          {lowAttendance ? (
            <Card className={`border-l-4 ${intelligenceToneClass.danger}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risco por Frequência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pedagogical!.attendance.percentage}%</div>
                <p className="text-xs text-muted-foreground">Frequência abaixo do ideal</p>
              </CardContent>
            </Card>
          ) : null}
          {pendingAssignments > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.warning}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Atividades Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingAssignments}</div>
                <p className="text-xs text-muted-foreground">Entregas próximas do prazo</p>
              </CardContent>
            </Card>
          ) : null}
          {lowGrades > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.warning}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Queda de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{lowGrades}</div>
                <p className="text-xs text-muted-foreground">Notas recentes abaixo de 70%</p>
              </CardContent>
            </Card>
          ) : null}
          {!lowAttendance && pendingAssignments === 0 && lowGrades === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="py-7 text-center">
                <CheckCircle className="mx-auto mb-2 h-9 w-9 text-chart-2" />
                <p className="text-base font-semibold text-chart-2">Tudo em ordem!</p>
                <p className="text-sm text-muted-foreground">Nenhum alerta pedagógico no momento</p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pedagogical!.attendance.percentage}%</div>
              <Progress value={pedagogical!.attendance.percentage} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média Recente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pedagogical!.recentGrades.length
                  ? (
                      pedagogical!.recentGrades.reduce(
                        (sum: number, grade: PedagogicalGrade) => sum + Number(grade.grade || 0),
                        0
                      ) / Math.max(pedagogical!.recentGrades.length, 1)
                    ).toFixed(1)
                  : '-'}
              </div>
              <p className="text-xs text-muted-foreground">Últimas avaliações</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAssignments}</div>
              <p className="text-xs text-muted-foreground">Tarefas aguardando entrega</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendência de Notas</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer
                config={pedagogicalChartConfig}
                className="h-full w-full! aspect-auto"
              >
                <BarChart data={gradeChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="grade" fill="var(--color-grade)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendência de Frequência</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer
                config={pedagogicalChartConfig}
                className="h-full w-full! aspect-auto"
              >
                <LineChart data={attendanceChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="attendance" stroke="var(--color-attendance)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'school-life' && canShowPedagogical) {
    const pendingComunicados = Array.isArray(pendingAck) ? pendingAck.length : 0
    const occurrencesData = (occurrences as { data?: unknown[] } | undefined)?.data
    const calendarData = (calendar as { data?: unknown[] } | undefined)?.data
    const occurrencesCount = Array.isArray(occurrencesData) ? occurrencesData.length : 0
    const eventsCount = Array.isArray(calendarData) ? calendarData.length : 0
    const pendingByType = [
      { label: 'Comunicados', value: pendingComunicados },
      { label: 'Ocorrências', value: occurrencesCount },
      { label: 'Eventos', value: eventsCount },
    ]

    return (
      <div className="space-y-6">
        {renderStudentInfo}
        <div className="grid gap-4 md:grid-cols-3">
          {pendingComunicados > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.warning}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comunicados Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingComunicados}</div>
                <p className="text-xs text-muted-foreground">Aguardando ciência</p>
              </CardContent>
            </Card>
          ) : null}
          {occurrencesCount > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.warning}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ocorrências Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{occurrencesCount}</div>
                <p className="text-xs text-muted-foreground">Registros recentes</p>
              </CardContent>
            </Card>
          ) : null}
          {eventsCount > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.info}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Eventos da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{eventsCount}</div>
                <p className="text-xs text-muted-foreground">Compromissos próximos</p>
              </CardContent>
            </Card>
          ) : null}
          {pendingComunicados === 0 && occurrencesCount === 0 && eventsCount === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="py-7 text-center">
                <CheckCircle className="mx-auto mb-2 h-9 w-9 text-chart-2" />
                <p className="text-base font-semibold text-chart-2">Tudo em ordem!</p>
                <p className="text-sm text-muted-foreground">
                  Não há alertas de vida escolar no momento
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comunicados</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingComunicados}</div>
              <p className="text-xs text-muted-foreground">Pendentes de ciência</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocorrências</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occurrencesCount}</div>
              <p className="text-xs text-muted-foreground">Total recente</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{eventsCount}</div>
              <p className="text-xs text-muted-foreground">Calendário próximo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pendências por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer config={schoolLifeChartConfig} className="h-full w-full! aspect-auto">
                <BarChart data={pendingByType}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linha de Eventos</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer config={schoolLifeChartConfig} className="h-full w-full! aspect-auto">
                <LineChart data={pendingByType}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (mode === 'financial' && canShowFinancial) {
    const invoices = (invoicesData?.data ?? []) as StudentInvoice[]
    const now = new Date()

    const isOverdueInvoice = (invoice: StudentInvoice) => {
      if (invoice.status === 'OVERDUE') return true
      if (invoice.status !== 'OPEN' && invoice.status !== 'PENDING') return false
      return new Date(String(invoice.dueDate)) < now
    }

    const isPendingInvoice = (invoice: StudentInvoice) => {
      if (invoice.status !== 'OPEN' && invoice.status !== 'PENDING') return false
      return new Date(String(invoice.dueDate)) >= now
    }

    const pendingCount = invoices.filter((invoice) => isPendingInvoice(invoice)).length
    const overdueCount = invoices.filter((invoice) => isOverdueInvoice(invoice)).length
    const dueSoonInvoices = invoices.filter((invoice) => {
      if (!isPendingInvoice(invoice)) return false
      const dueDate = new Date(String(invoice.dueDate))
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilDue >= 0 && daysUntilDue <= 7
    })
    const dueSoonCount = dueSoonInvoices.length
    const nextDueInvoice = dueSoonInvoices
      .slice()
      .sort(
        (a, b) => new Date(String(a.dueDate)).getTime() - new Date(String(b.dueDate)).getTime()
      )[0]
    const nextDueDays = nextDueInvoice
      ? Math.ceil(
          (new Date(String(nextDueInvoice.dueDate)).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      : null

    const paymentStatusData = [
      { label: 'Pendentes', value: pendingCount },
      { label: 'Vencidas', value: overdueCount },
      { label: 'A vencer', value: dueSoonCount },
    ]
    const paymentTimeline = invoices
      .slice(0, 6)
      .reverse()
      .map((invoice, index: number) => ({
        label: `#${index + 1}`,
        value: Number(invoice.totalAmount || 0),
      }))

    return (
      <div className="space-y-6">
        {renderStudentInfo}
        <div className="grid gap-4 md:grid-cols-3">
          {overdueCount > 0 ? (
            <Card className={`border-l-4 ${intelligenceToneClass.danger}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Faturas Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overdueCount}</div>
                <p className="text-xs text-muted-foreground">Prioridade de regularização</p>
              </CardContent>
            </Card>
          ) : null}
          {nextDueInvoice && nextDueDays !== null ? (
            <Card className={`border-l-4 ${intelligenceToneClass.warning}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Próxima Fatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {nextDueDays === 0 ? 'Vence hoje' : `Vence em ${nextDueDays} dia(s)`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(Number(nextDueInvoice.totalAmount || 0))} -{' '}
                  {new Intl.DateTimeFormat('pt-BR').format(
                    new Date(String(nextDueInvoice.dueDate))
                  )}
                </p>
              </CardContent>
            </Card>
          ) : null}
          {pendingCount === 0 && overdueCount === 0 && !nextDueInvoice ? (
            <Card className="md:col-span-3">
              <CardContent className="py-7 text-center">
                <CheckCircle className="mx-auto mb-2 h-9 w-9 text-chart-2" />
                <p className="text-base font-semibold text-chart-2">Tudo em ordem!</p>
                <p className="text-sm text-muted-foreground">
                  Não há alertas financeiros no momento
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financial!.totalPending)}</div>
              <p className="text-xs text-muted-foreground">Total em aberto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensalidades Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueCount}</div>
              <p className="text-xs text-muted-foreground">Aguardando regularização</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Cantina</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(overviewData.canteen.balance)}
              </div>
              <p className="text-xs text-muted-foreground">Disponível para consumo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status de Faturas</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer config={financialChartConfig} className="h-full w-full! aspect-auto">
                <BarChart data={paymentStatusData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tendência de Cobranças</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ChartContainer config={financialChartConfig} className="h-full w-full! aspect-auto">
                <LineChart data={paymentTimeline}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" />
                  <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />
                    }
                  />
                  <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Sem dados disponíveis para este domínio.</AlertDescription>
    </Alert>
  )
}

export function DashboardOverviewContainer({
  studentId,
  mode = 'pedagogical',
}: {
  studentId: string
  mode?: DashboardOverviewMode
}) {
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
          <DashboardOverviewContent studentId={studentId} mode={mode} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
