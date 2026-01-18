import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useStudentPaymentsQueryOptions } from '../hooks/queries/use-student-payments'
import type { StudentPaymentsResponse } from '../hooks/queries/use-student-payments'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

// Loading Skeleton
function StudentPaymentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded ml-auto" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function StudentPaymentsError({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar mensalidades</h3>
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

type StudentPaymentsData = Exclude<StudentPaymentsResponse, undefined>

type PaymentStatus = NonNullable<
  NonNullable<Parameters<typeof useStudentPaymentsQueryOptions>[0]>['status']
>

type StatusConfig = { label: string; className: string; icon: any }

const statusConfig: Record<PaymentStatus, StatusConfig> = {
  NOT_PAID: { label: 'Não pago', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Pago', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencido', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700', icon: XCircle },
  FAILED: { label: 'Falhou', className: 'bg-gray-100 text-gray-700', icon: XCircle },
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Content Component
function StudentPaymentsContent({
  page,
  onPageChange,
  status,
}: {
  page: number
  onPageChange: (page: number) => void
  status?: PaymentStatus
}) {
  const { data } = useSuspenseQuery(useStudentPaymentsQueryOptions({ page, limit: 20, status }))

  const payments = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhuma mensalidade encontrada</h3>
          <p className="text-sm text-muted-foreground mt-1">
            As mensalidades dos alunos aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Aluno</th>
              <th className="text-left p-4 font-medium">Referência</th>
              <th className="text-left p-4 font-medium">Vencimento</th>
              <th className="text-left p-4 font-medium">Valor</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment: any) => {
              const config = statusConfig[(payment.status as PaymentStatus) || 'PENDING']
              const StatusIcon = config.icon

              return (
                <tr key={payment.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                        {payment.student?.user?.name?.charAt(0) ||
                          payment.student?.name?.charAt(0) ||
                          'A'}
                      </div>
                      <span className="font-medium">
                        {payment.student?.user?.name || payment.student?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {payment.month}/{payment.year}
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(payment.dueDate)}</td>
                  <td className="p-4 font-semibold">R$ {Number(payment.amount || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {payments.length} de {meta.total} mensalidades
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Container Export
export function StudentPaymentsContainer({
  status,
  showSearch = true,
}: {
  status?: PaymentStatus
  showSearch?: boolean
}) {
  const [page, setPage] = useState(1)

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar mensalidades..." className="pl-9" />
          </div>
        </div>
      )}

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <StudentPaymentsError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<StudentPaymentsSkeleton />}>
              <StudentPaymentsContent page={page} onPageChange={setPage} status={status} />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
