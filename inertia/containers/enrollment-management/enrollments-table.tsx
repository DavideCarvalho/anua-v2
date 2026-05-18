import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { Link } from '@adonisjs/inertia/react'
import {
  FileText,
  PenLine,
  CreditCard,
  Users,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip'
import { cn } from '../../lib/utils'

import type { Route } from '@tuyau/core/types'
import { api } from '~/lib/api'
import { brazilianDateFormatter } from '../../lib/formatters'

type EnrollmentsResponse = Route.Response<'api.v1.enrollments.index'>
type Enrollment = EnrollmentsResponse['data'][number]

const STATUS_OPTIONS = [
  { label: 'Pendente', value: 'PENDING_DOCUMENT_REVIEW' },
  { label: 'Concluída', value: 'REGISTERED' },
] as const

type EnrollmentStatus = (typeof STATUS_OPTIONS)[number]['value']

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
}

function EnrollmentsErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar matrículas</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

interface EnrollmentsTableProps {
  schoolId: string
  academicPeriodId?: string
  levelId?: string
}

export function EnrollmentsTable({ schoolId, academicPeriodId, levelId }: EnrollmentsTableProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <EnrollmentsErrorFallback
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <EnrollmentsTableContent
            schoolId={schoolId}
            academicPeriodId={academicPeriodId}
            levelId={levelId}
          />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function EnrollmentsTableContent({ schoolId, academicPeriodId, levelId }: EnrollmentsTableProps) {
  const [filters, setFilters] = useQueryStates({
    status: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { status: statusFilter, page, limit } = filters
  const normalizedStatus: Route.Query<'api.v1.enrollments.index'>['status'] =
    statusFilter && isEnrollmentStatus(statusFilter) ? statusFilter : undefined

  const { data } = useQuery(
    api.api.v1.enrollments.index.queryOptions({
      query: {
        schoolId,
        academicPeriodId,
        levelId,
        status: normalizedStatus,
        page,
        limit,
      },
    })
  )

  const rows = data?.data || []
  // metadata is inferred via Tuyau as SimplePaginatorMetaKeys (keys-as-strings),
  // but runtime values are numeric — coerce defensively.
  const rawMeta = data?.metadata
  const currentPage = rawMeta ? Number(rawMeta.currentPage) : 1
  const lastPage = rawMeta ? Number(rawMeta.lastPage) : 1
  const total = rawMeta ? Number(rawMeta.total) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setFilters({ status: value === 'all' ? null : value, page: 1 })
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          {rows.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhuma matrícula encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Nível / Período</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row: Enrollment) => (
                  <EnrollmentTableRow key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          )}

          {rawMeta && lastPage > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {lastPage} · {total} matrícula
                {total === 1 ? '' : 's'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= lastPage}
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function EnrollmentTableRow({ row }: { row: Enrollment }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="font-medium">{row.studentName}</div>
        {row.studentEmail && (
          <div className="text-xs text-muted-foreground">{row.studentEmail}</div>
        )}
      </TableCell>
      <TableCell className="text-sm">
        <div>{row.levelName ?? '-'}</div>
        {row.academicPeriodName && (
          <div className="text-xs text-muted-foreground">{row.academicPeriodName}</div>
        )}
      </TableCell>
      <TableCell>
        <DocsAxisBadge axis={row.axes.docs} />
      </TableCell>
      <TableCell>
        <SignatureAxisBadge status={row.axes.signature.status} />
      </TableCell>
      <TableCell>
        <PaymentAxisBadge status={row.axes.payment.status} />
      </TableCell>
      <TableCell>
        <ClassAxisBadge status={row.axes.classAllocation.status} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {brazilianDateFormatter(row.createdAt)}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/escola/matriculas/${row.id}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function DocsAxisBadge({ axis }: { axis: Enrollment['axes']['docs'] }) {
  const { status, approved, required, rejected } = axis
  const tone =
    status === 'COMPLETE'
      ? 'border-green-200 bg-green-50 text-green-700'
      : status === 'REJECTED'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-yellow-200 bg-yellow-50 text-yellow-700'
  const label =
    status === 'COMPLETE'
      ? 'Aprovados'
      : status === 'REJECTED'
        ? `${rejected} rejeitado${rejected === 1 ? '' : 's'}`
        : `${approved} de ${required}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={cn('gap-1', tone)}>
            <FileText className="h-3 w-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {status === 'COMPLETE'
            ? 'Documentação completa'
            : status === 'REJECTED'
              ? 'Há documentos rejeitados aguardando reenvio'
              : `${approved} aprovados de ${required} obrigatórios`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function SignatureAxisBadge({ status }: { status: Enrollment['axes']['signature']['status'] }) {
  if (status === 'NOT_APPLICABLE') {
    return <Badge variant="outline">N/A</Badge>
  }
  const tone =
    status === 'COMPLETED'
      ? 'border-green-200 bg-green-50 text-green-700'
      : status === 'DECLINED' || status === 'CANCELLED'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-yellow-200 bg-yellow-50 text-yellow-700'
  const label =
    status === 'COMPLETED'
      ? 'Assinado'
      : status === 'PARTIALLY_SIGNED'
        ? 'Parcial'
        : status === 'DECLINED'
          ? 'Recusado'
          : status === 'CANCELLED'
            ? 'Cancelado'
            : 'Pendente'

  return (
    <Badge variant="outline" className={cn('gap-1', tone)}>
      <PenLine className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function PaymentAxisBadge({ status }: { status: Enrollment['axes']['payment']['status'] }) {
  if (status === 'NOT_APPLICABLE') {
    return <Badge variant="outline">N/A</Badge>
  }
  const tone =
    status === 'PAID'
      ? 'border-green-200 bg-green-50 text-green-700'
      : status === 'OVERDUE'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-yellow-200 bg-yellow-50 text-yellow-700'
  const label = status === 'PAID' ? 'Paga' : status === 'OVERDUE' ? 'Atrasada' : 'Pendente'

  return (
    <Badge variant="outline" className={cn('gap-1', tone)}>
      <CreditCard className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function ClassAxisBadge({ status }: { status: Enrollment['axes']['classAllocation']['status'] }) {
  const tone =
    status === 'ALLOCATED'
      ? 'border-green-200 bg-green-50 text-green-700'
      : 'border-yellow-200 bg-yellow-50 text-yellow-700'
  const label = status === 'ALLOCATED' ? 'Definida' : 'Pendente'

  return (
    <Badge variant="outline" className={cn('gap-1', tone)}>
      <Users className="h-3 w-3" />
      {label}
    </Badge>
  )
}
