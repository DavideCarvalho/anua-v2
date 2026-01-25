import { Head } from '@inertiajs/react'
import { FileText, Search, Filter, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs'

import { AdminLayout } from '../../../components/layouts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'
import { Badge } from '../../../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Skeleton } from '../../../components/ui/skeleton'
import { useSubscriptionInvoicesQueryOptions } from '../../../hooks/queries/use_subscription_invoices'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../../lib/formatters'

const STATUS_OPTIONS = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Paga', value: 'PAID' },
  { label: 'Atrasada', value: 'OVERDUE' },
  { label: 'Cancelada', value: 'CANCELED' },
  { label: 'Reembolsada', value: 'REFUNDED' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  PAID: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  CANCELED: 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300',
  REFUNDED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Paga',
  OVERDUE: 'Atrasada',
  CANCELED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

function FaturasTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export default function BillingFaturasPage() {
  const [status, setStatus] = useQueryState('status', parseAsString)
  const [search, setSearch] = useQueryState('search', parseAsString)
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))

  const { data, isLoading, isError, error, refetch } = useQuery(
    useSubscriptionInvoicesQueryOptions({
      status: status || undefined,
      page,
      limit: 20,
    })
  )

  const invoices = data?.data || []
  const meta = data?.meta

  const filteredInvoices = search
    ? invoices.filter((invoice: any) =>
        invoice.subscription?.school?.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
    : invoices

  const formatPeriod = (month: number, year: number) => {
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  return (
    <AdminLayout>
      <Head title="Faturas - Admin" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Faturas
          </h1>
          <p className="text-muted-foreground">Gerencie as faturas das escolas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Faturas</CardTitle>
            <CardDescription>Visualize e gerencie todas as faturas de assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar escola..."
                  className="pl-9"
                  value={search || ''}
                  onChange={(e) => setSearch(e.target.value || null)}
                />
              </div>
              <Select
                value={status || 'all'}
                onValueChange={(value) => setStatus(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
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

            {/* Loading */}
            {isLoading && <FaturasTableSkeleton />}

            {/* Error */}
            {isError && (
              <Card className="border-destructive">
                <CardContent className="flex items-center gap-4 py-6">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive">Erro ao carregar faturas</h3>
                    <p className="text-sm text-muted-foreground">
                      {error?.message || 'Ocorreu um erro inesperado'}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => refetch()}>
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Table */}
            {!isLoading && !isError && (
              <>
                {filteredInvoices.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Escola</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Alunos Ativos</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.subscription?.school?.name || 'Escola não encontrada'}
                          </TableCell>
                          <TableCell className="capitalize">
                            {formatPeriod(invoice.month, invoice.year)}
                          </TableCell>
                          <TableCell>{invoice.activeStudents}</TableCell>
                          <TableCell>{brazilianRealFormatter(invoice.amount / 100)}</TableCell>
                          <TableCell>{brazilianDateFormatter(invoice.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_COLORS[invoice.status] || ''}>
                              {STATUS_LABELS[invoice.status] || invoice.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {meta && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Página {meta.currentPage} de {meta.lastPage} ({meta.total} faturas)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage >= meta.lastPage}
                        onClick={() => setPage(page + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
