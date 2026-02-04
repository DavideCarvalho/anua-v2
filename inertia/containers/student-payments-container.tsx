import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import type { LucideIcon } from 'lucide-react'
import {
  useStudentPaymentsQueryOptions,
  type StudentPaymentsResponse,
} from '../hooks/queries/use_student_payments'
import { useClassesQueryOptions, type ClassesResponse } from '../hooks/queries/use_classes'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
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
  Pencil,
  Handshake,
  FilterX,
} from 'lucide-react'
import { formatCurrency } from '../lib/utils'
import { EditPaymentModal } from './student-payments/edit-payment-modal'
import { MarkPaidModal } from './student-payments/mark-paid-modal'
import { CancelPaymentDialog } from './student-payments/cancel-payment-dialog'
import { CreateAgreementModal } from './student-payments/create-agreement-modal'

// Loading Skeleton
function StudentPaymentsSkeleton() {
  return (
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
  )
}

// Error Fallback
function StudentPaymentsErrorFallback({
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

type PaymentStatus = NonNullable<
  NonNullable<Parameters<typeof useStudentPaymentsQueryOptions>[0]>['status']
>

type PaymentType = NonNullable<
  NonNullable<Parameters<typeof useStudentPaymentsQueryOptions>[0]>['type']
>

type StatusConfig = { label: string; className: string; icon: LucideIcon }

const statusConfig: Record<PaymentStatus, StatusConfig> = {
  NOT_PAID: { label: 'Não pago', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Pago', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencido', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700', icon: XCircle },
  FAILED: { label: 'Falhou', className: 'bg-gray-100 text-gray-700', icon: XCircle },
}

const typeLabels: Record<string, string> = {
  ENROLLMENT: 'Matrícula',
  TUITION: 'Mensalidade',
  CANTEEN: 'Cantina',
  COURSE: 'Curso',
  AGREEMENT: 'Acordo',
  STUDENT_LOAN: 'Empréstimo',
  OTHER: 'Outro',
}

const monthLabels = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

type Payment = StudentPaymentsResponse['data'][number]

type ClassItem = ClassesResponse['data'][number]

type PaginationMeta = StudentPaymentsResponse['meta']

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

// Container Export
export function StudentPaymentsContainer({
  status,
  showSearch = true,
}: {
  status?: PaymentStatus
  showSearch?: boolean
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <StudentPaymentsErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <StudentPaymentsContent status={status} showSearch={showSearch} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

type ModalType = 'edit' | 'mark-paid' | 'cancel' | 'agreement' | null

const ACTIONABLE_STATUSES: PaymentStatus[] = ['NOT_PAID', 'PENDING', 'OVERDUE']

function StudentPaymentsContent({
  status,
  showSearch = true,
}: {
  status?: PaymentStatus
  showSearch?: boolean
}) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  function openModal(payment: Payment, modal: ModalType) {
    setSelectedPayment(payment)
    setActiveModal(modal)
  }

  function closeModal() {
    setActiveModal(null)
    setSelectedPayment(null)
  }

  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    status: parseAsString,
    type: parseAsString,
    month: parseAsInteger,
    year: parseAsInteger,
    classId: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit, status: filterStatus, type: filterType, month: filterMonth, year: filterYear, classId } = filters

  const activeStatus = status || (filterStatus as PaymentStatus) || undefined

  const { data: classesData } = useQuery(useClassesQueryOptions({ limit: 100 }))
  const classes: ClassItem[] = classesData?.data ?? []

  const hasActiveFilters = !!(filterStatus || filterType || filterMonth || filterYear || classId)

  function clearFilters() {
    setFilters({ status: null, type: null, month: null, year: null, classId: null, page: 1 })
  }

  const { data, isLoading, error, refetch } = useQuery(
    useStudentPaymentsQueryOptions({
      page,
      limit,
      status: activeStatus,
      search: search || undefined,
      type: (filterType as PaymentType) || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
      classId: classId || undefined,
    })
  )

  const payments: Payment[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              className="pl-9"
              value={search || ''}
              onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
            />
          </div>

          {!status && (
            <Select
              value={filterStatus || '_all'}
              onValueChange={(v) => setFilters({ status: v === '_all' ? null : v, page: 1 })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos status</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={filterType || '_all'}
            onValueChange={(v) => setFilters({ type: v === '_all' ? null : v, page: 1 })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos tipos</SelectItem>
              {Object.entries(typeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterMonth?.toString() || '_all'}
            onValueChange={(v) => setFilters({ month: v === '_all' ? null : Number(v), page: 1 })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos meses</SelectItem>
              {monthLabels.map((label, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterYear?.toString() || '_all'}
            onValueChange={(v) => setFilters({ year: v === '_all' ? null : Number(v), page: 1 })}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todos anos</SelectItem>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={classId || '_all'}
            onValueChange={(v) => setFilters({ classId: v === '_all' ? null : v, page: 1 })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Todas turmas</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <FilterX className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      )}

      {isLoading && <StudentPaymentsSkeleton />}

      {error && (
        <StudentPaymentsErrorFallback error={error} resetErrorBoundary={() => refetch()} />
      )}

      {!isLoading && !error && payments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma mensalidade encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              As mensalidades dos alunos aparecerão aqui
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && payments.length > 0 && (
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
                {payments.map((payment) => {
                  const config = statusConfig[(payment.status as PaymentStatus) || 'PENDING']
                  const StatusIcon = config.icon

                  return (
                    <tr key={payment.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {payment.student?.user?.name?.charAt(0) || 'A'}
                          </div>
                          <span className="font-medium">
                            {payment.student?.user?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {payment.month}/{payment.year}
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(payment.dueDate)}</td>
                      <td className="p-4 font-semibold">{formatCurrency(Number(payment.amount || 0))}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {ACTIONABLE_STATUSES.includes(payment.status as PaymentStatus) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openModal(payment, 'edit')}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openModal(payment, 'mark-paid')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como pago
                              </DropdownMenuItem>
                              {payment.type !== 'AGREEMENT' && (
                                <>
                                  <DropdownMenuItem onClick={() => openModal(payment, 'agreement')}>
                                    <Handshake className="h-4 w-4 mr-2" />
                                    Criar acordo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => openModal(payment, 'cancel')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
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
                  onClick={() => setFilters({ page: page - 1 })}
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
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPayment && activeModal === 'edit' && (
        <EditPaymentModal
          payment={selectedPayment}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedPayment && activeModal === 'mark-paid' && (
        <MarkPaidModal
          payment={selectedPayment}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedPayment && activeModal === 'cancel' && (
        <CancelPaymentDialog
          payment={selectedPayment}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedPayment && activeModal === 'agreement' && (
        <CreateAgreementModal
          payment={selectedPayment}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}
    </div>
  )
}
