import { useState } from 'react'
import { useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs'
import type { LucideIcon } from 'lucide-react'
import {
  useInvoicesQueryOptions,
  type InvoicesResponse,
} from '../hooks/queries/use_invoices'
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
  ChevronDown,
  FileText,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Handshake,
  FilterX,
  RefreshCw,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Checkbox } from '../components/ui/checkbox'
import { formatCurrency } from '../lib/utils'
import { MarkInvoicePaidModal } from './invoices/mark-invoice-paid-modal'
import { CreateAgreementModal } from './invoices/create-agreement-modal'

// Loading Skeleton
function InvoicesSkeleton() {
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
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Error Fallback
function InvoicesErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar faturas</h3>
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

type InvoiceStatus = 'OPEN' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'RENEGOTIATED'
type InvoiceType = 'MONTHLY' | 'UPFRONT'
type StatusConfig = { label: string; className: string; icon: LucideIcon }

const statusConfig: Record<InvoiceStatus, StatusConfig> = {
  OPEN: { label: 'Aberta', className: 'bg-blue-100 text-blue-700', icon: Clock },
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { label: 'Paga', className: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { label: 'Vencida', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
  CANCELLED: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700', icon: XCircle },
  RENEGOTIATED: { label: 'Renegociada', className: 'bg-purple-100 text-purple-700', icon: RefreshCw },
}

const typeLabels: Record<InvoiceType, string> = {
  MONTHLY: 'Mensal',
  UPFRONT: 'À vista',
}

const monthLabels = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

type Invoice = InvoicesResponse['data'][number]
type PaginationMeta = InvoicesResponse['meta']

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const ACTIONABLE_STATUSES: InvoiceStatus[] = ['OPEN', 'PENDING', 'OVERDUE']

// Container Export
export function InvoicesContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <InvoicesErrorFallback error={error as Error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <InvoicesContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

type ModalType = 'mark-paid' | 'agreement' | null

function InvoicesContent() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  function openModal(invoice: Invoice, modal: ModalType) {
    setSelectedInvoice(invoice)
    setActiveModal(modal)
  }

  function closeModal() {
    setActiveModal(null)
    setSelectedInvoice(null)
  }

  const DEFAULT_STATUSES: InvoiceStatus[] = ['OPEN', 'PENDING', 'OVERDUE']

  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    status: parseAsArrayOf(parseAsString).withDefault(DEFAULT_STATUSES),
    type: parseAsString,
    month: parseAsInteger,
    year: parseAsInteger,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit, status: filterStatuses, type: filterType, month: filterMonth, year: filterYear } = filters

  function toggleStatus(value: string) {
    const current = filterStatuses || []
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    setFilters({ status: next.length > 0 ? next : null, page: 1 })
  }

  const isDefaultStatuses =
    filterStatuses.length === DEFAULT_STATUSES.length &&
    DEFAULT_STATUSES.every((s) => filterStatuses.includes(s))

  const hasActiveFilters = !!(!isDefaultStatuses || filterType || filterMonth || filterYear)

  function clearFilters() {
    setFilters({ status: DEFAULT_STATUSES, type: null, month: null, year: null, page: 1 })
  }

  const { data, isLoading, error, refetch } = useQuery(
    useInvoicesQueryOptions({
      page,
      limit,
      status: filterStatuses.length > 0 ? filterStatuses.join(',') : undefined,
      type: (filterType as InvoiceType) || undefined,
      month: filterMonth || undefined,
      year: filterYear || undefined,
    })
  )

  const invoices: Invoice[] = data?.data ?? []
  const meta: PaginationMeta | undefined = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-between">
              {filterStatuses.length === 0 ? (
                <span className="text-muted-foreground">Status</span>
              ) : filterStatuses.length === Object.keys(statusConfig).length ? (
                <span>Todos status</span>
              ) : (
                <span className="truncate">
                  {filterStatuses.length === 1
                    ? statusConfig[filterStatuses[0] as InvoiceStatus]?.label
                    : `${filterStatuses.length} status`}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="space-y-1">
              {Object.entries(statusConfig).map(([value, config]) => (
                <label
                  key={value}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                >
                  <Checkbox
                    checked={filterStatuses.includes(value)}
                    onCheckedChange={() => toggleStatus(value)}
                  />
                  {config.label}
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Select
          value={filterType || '_all'}
          onValueChange={(v) => setFilters({ type: v === '_all' ? null : v, page: 1 })}
        >
          <SelectTrigger className="w-32">
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

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <FilterX className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {isLoading && <InvoicesSkeleton />}

      {error && (
        <InvoicesErrorFallback error={error} resetErrorBoundary={() => refetch()} />
      )}

      {!isLoading && !error && invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma fatura encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              As faturas dos alunos aparecerão aqui quando forem geradas
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && invoices.length > 0 && (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Aluno</th>
                  <th className="text-left p-4 font-medium">Tipo</th>
                  <th className="text-left p-4 font-medium">Referência</th>
                  <th className="text-left p-4 font-medium">Vencimento</th>
                  <th className="text-left p-4 font-medium">Valor</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const config = statusConfig[(invoice.status as InvoiceStatus) || 'OPEN']
                  const StatusIcon = config.icon

                  return (
                    <tr key={invoice.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                            {(invoice as any).student?.user?.name?.charAt(0) || 'A'}
                          </div>
                          <span className="font-medium">
                            {(invoice as any).student?.user?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {typeLabels[(invoice.type as InvoiceType)] || invoice.type}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {invoice.month && invoice.year ? `${invoice.month}/${invoice.year}` : '-'}
                      </td>
                      <td className="p-4 text-muted-foreground">{formatDate(invoice.dueDate)}</td>
                      <td className="p-4 font-semibold">{formatCurrency(Number(invoice.totalAmount || 0))}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {ACTIONABLE_STATUSES.includes(invoice.status as InvoiceStatus) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openModal(invoice, 'mark-paid')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como paga
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openModal(invoice, 'agreement')}>
                                <Handshake className="h-4 w-4 mr-2" />
                                Renegociar
                              </DropdownMenuItem>
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
                Mostrando {invoices.length} de {meta.total} faturas
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

      {selectedInvoice && activeModal === 'mark-paid' && (
        <MarkInvoicePaidModal
          invoice={selectedInvoice}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}

      {selectedInvoice && activeModal === 'agreement' && (
        <CreateAgreementModal
          invoice={selectedInvoice}
          open
          onOpenChange={(open) => !open && closeModal()}
        />
      )}
    </div>
  )
}
