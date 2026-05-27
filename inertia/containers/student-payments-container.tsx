import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import type { LucideIcon } from 'lucide-react'
import { api } from '../lib/api'
import type { Route } from '@tuyau/core/types'

type StudentPaymentsResponse = Route.Response<'api.v1.student_payments.index'>
type ClassesResponse = Route.Response<'api.v1.classes.index'>
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
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '../components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
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
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-4 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="p-4 border-b last:border-0">
          <div className="grid grid-cols-7 gap-4">
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
  NonNullable<Route.Query<'api.v1.student_payments.index'>>['status']
>

type PaymentType = NonNullable<NonNullable<Route.Query<'api.v1.student_payments.index'>>['type']>

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
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

type Payment = StudentPaymentsResponse['data'][number]

type ClassItem = ClassesResponse['data'][number]

type PaginationMeta = StudentPaymentsResponse['metadata']

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

const OVERDUE_AWARE_STATUSES: readonly PaymentStatus[] = ['NOT_PAID', 'PENDING', 'OVERDUE']

function isOverdueAwareStatus(status: PaymentStatus | string | null | undefined): boolean {
  if (!status) return false
  return OVERDUE_AWARE_STATUSES.some((value) => value === status)
}

function getDaysOverdue(
  status: PaymentStatus | string | null | undefined,
  dueDate: string | Date | null | undefined
): number {
  if (!dueDate) return 0
  if (!isOverdueAwareStatus(status)) return 0

  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return 0

  const now = new Date()
  const start = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = today.getTime() - start.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

function formatDaysOverdue(days: number): string {
  if (days <= 0) return '-'
  if (days < 30) return `${days} ${days === 1 ? 'dia' : 'dias'}`
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'ano' : 'anos'}`
}

function getDaysOverdueClass(days: number): string {
  if (days <= 0) return 'text-muted-foreground'
  if (days > 60) return 'font-semibold text-destructive'
  if (days > 30) return 'font-medium text-amber-600 dark:text-amber-400'
  return 'text-amber-600 dark:text-amber-400'
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
            <StudentPaymentsErrorFallback
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false)
  const [proposalInstallments, setProposalInstallments] = useState(2)
  const queryClient = useQueryClient()

  function openModal(payment: Payment, modal: ModalType) {
    setSelectedPayment(payment)
    setActiveModal(modal)
  }

  function closeModal() {
    setActiveModal(null)
    setSelectedPayment(null)
  }

  function toggleSelection(paymentId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(paymentId)) next.delete(paymentId)
      else next.add(paymentId)
      return next
    })
  }

  const createProposalMutation = useMutation(
    api.api.v1.agreementProposals.store.mutationOptions()
  )

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

  const {
    search,
    page,
    limit,
    status: filterStatus,
    type: filterType,
    month: filterMonth,
    year: filterYear,
    classId,
  } = filters

  const activeStatus = status || (filterStatus as PaymentStatus) || undefined

  const { data: classesData } = useQuery(
    api.api.v1.classes.index.queryOptions({ query: { limit: 100 } })
  )
  const classes: ClassItem[] = classesData?.data ?? []

  const hasActiveFilters = !!(filterStatus || filterType || filterMonth || filterYear || classId)

  function clearFilters() {
    setFilters({ status: null, type: null, month: null, year: null, classId: null, page: 1 })
  }

  const { data, isLoading, error, refetch } = useQuery(
    api.api.v1.studentPayments.index.queryOptions({
      query: {
        page,
        limit,
        status: activeStatus,
        search: search || undefined,
        type: (filterType as PaymentType) || undefined,
        month: filterMonth || undefined,
        year: filterYear || undefined,
        classId: classId || undefined,
      },
    })
  )

  const payments: Payment[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.metadata

  const selectedPayments = useMemo(
    () => payments.filter((p) => selectedIds.has(p.id)),
    [payments, selectedIds]
  )

  const selectedStudentIds = useMemo(
    () => new Set(selectedPayments.map((p) => p.student?.id).filter(Boolean)),
    [selectedPayments]
  )

  const canCreateProposal =
    selectedPayments.length >= 2 && selectedStudentIds.size === 1

  const proposalError = selectedPayments.length >= 2 && selectedStudentIds.size > 1
    ? 'Selecione faturas do mesmo aluno'
    : null

  async function handleCreateProposal() {
    try {
      const invoiceIds = selectedPayments
        .map((p) => p.invoiceId)
        .filter((id): id is string => !!id)

      await createProposalMutation.mutateAsync({
        body: { invoiceIds, installments: proposalInstallments },
      })
      toast.success('Proposta de acordo criada')
      setSelectedIds(new Set())
      setProposalDialogOpen(false)
      await queryClient.invalidateQueries({
        queryKey: api.api.v1.agreementProposals.index.pathKey(),
      })
    } catch {
      toast.error('Erro ao criar proposta')
    }
  }

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
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      )}

      {isLoading && <StudentPaymentsSkeleton />}

      {error instanceof Error && (
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
                  {activeStatus === 'OVERDUE' && <th className="w-10 p-4" />}
                  <th className="text-left p-4 font-medium">Aluno</th>
                  <th className="text-left p-4 font-medium">Referência</th>
                  <th className="text-left p-4 font-medium">Vencimento</th>
                  <th className="text-left p-4 font-medium">Atraso</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const config = statusConfig[(payment.status as PaymentStatus) || 'PENDING']
                  const StatusIcon = config.icon
                  const daysOverdue = getDaysOverdue(payment.status, payment.dueDate)

                  return (
                    <tr key={payment.id} className={`border-t hover:bg-muted/30 transition-colors ${selectedIds.has(payment.id) ? 'bg-primary/5' : ''}`}>
                      {activeStatus === 'OVERDUE' && (
                        <td className="p-4">
                          <Checkbox
                            checked={selectedIds.has(payment.id)}
                            onCheckedChange={() => toggleSelection(payment.id)}
                          />
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {payment.student?.user?.name?.charAt(0) || 'A'}
                          </div>
                          <span className="font-medium">{payment.student?.user?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {payment.month}/{payment.year}
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(payment.dueDate)}</td>
                      <td className={`p-4 ${getDaysOverdueClass(daysOverdue)}`}>
                        {formatDaysOverdue(daysOverdue)}
                      </td>
                      <td className="p-4 font-semibold">
                        {formatCurrency(Number(payment.amount || 0))}
                      </td>
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
                  disabled={page >= Number(meta.lastPage)}
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedIds.size > 0 && activeStatus === 'OVERDUE' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} fatura{selectedIds.size > 1 ? 's' : ''} selecionada{selectedIds.size > 1 ? 's' : ''}
          </span>
          {proposalError && (
            <span className="text-xs text-destructive">{proposalError}</span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedIds(new Set())}
          >
            Limpar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (!canCreateProposal) {
                if (selectedIds.size < 2) toast.error('Selecione pelo menos 2 faturas')
                else if (selectedStudentIds.size > 1) toast.error('Selecione faturas do mesmo aluno')
                return
              }
              const total = selectedPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0)
              setProposalInstallments(total > 50000 ? 3 : 2)
              setProposalDialogOpen(true)
            }}
          >
            <FileText className="mr-1 h-3.5 w-3.5" />
            Criar proposta de acordo
          </Button>
        </div>
      )}

      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="z-[110]">
          <DialogHeader>
            <DialogTitle>Criar proposta de acordo</DialogTitle>
            <DialogDescription>
              Proposta para {selectedPayments[0]?.student?.user?.name ?? 'aluno'} com {selectedPayments.length} faturas em atraso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">
                Total: {formatCurrency(selectedPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0))}
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedPayments.map((p) => (
                  <span key={p.id} className="text-xs bg-background px-2 py-1 rounded ring-1 ring-foreground/10">
                    {p.month}/{p.year} — {formatCurrency(Number(p.amount ?? 0))}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parcelas</Label>
              <Select
                value={String(proposalInstallments)}
                onValueChange={(v) => setProposalInstallments(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2x de {formatCurrency(Math.ceil(selectedPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0) / 2))}</SelectItem>
                  <SelectItem value="3">3x de {formatCurrency(Math.ceil(selectedPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0) / 3))}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateProposal}
              disabled={createProposalMutation.isPending}
            >
              <Handshake className="mr-1 h-3.5 w-3.5" />
              Criar proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedPayment && activeModal === 'edit' && (
        <EditPaymentModal
          payment={{
            id: selectedPayment.id,
            amount: Number(selectedPayment.amount ?? 0),
            dueDate: selectedPayment.dueDate ?? new Date().toISOString(),
            discountPercentage: Number(selectedPayment.discountPercentage ?? 0),
            discountType: selectedPayment.discountType ?? undefined,
            discountValue: selectedPayment.discountValue ?? undefined,
            student: selectedPayment.student,
            month: Number(selectedPayment.month ?? 1),
            year: Number(selectedPayment.year ?? new Date().getFullYear()),
          }}
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
