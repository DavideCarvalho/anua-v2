import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Eye, Download } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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
import { Skeleton } from '../../components/ui/skeleton'

import { useInsuranceBillingsQueryOptions } from '../../hooks/queries/use-insurance-billings'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../lib/formatters'

const STATUS_OPTIONS = [
  { label: 'Pendente', value: 'PENDING' },
  { label: 'Pago', value: 'PAID' },
  { label: 'Vencido', value: 'OVERDUE' },
  { label: 'Cancelado', value: 'CANCELLED' },
]

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  PAID: 'border-green-200 bg-green-50 text-green-700',
  OVERDUE: 'border-red-200 bg-red-50 text-red-700',
  CANCELLED: 'border-gray-200 bg-gray-50 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
}

interface InsuranceBillingsTableProps {
  onViewDetails?: (billingId: string) => void
}

export function InsuranceBillingsTable({ onViewDetails }: InsuranceBillingsTableProps) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  const { data } = useSuspenseQuery(
    useInsuranceBillingsQueryOptions({
      status: statusFilter as any,
      page,
      limit: 10,
    })
  )

  const billings = data?.data || []
  const meta = data?.meta

  const formatPeriod = (period: string) => {
    const date = new Date(period)
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <Select
            value={statusFilter || ''}
            onValueChange={(value) => setStatusFilter(value || undefined)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
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
        <CardHeader>
          <CardTitle>Faturamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {billings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum faturamento encontrado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Taxa</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.map((billing: any) => (
                  <TableRow key={billing.id}>
                    <TableCell className="font-medium capitalize">
                      {formatPeriod(billing.period)}
                    </TableCell>
                    <TableCell>{billing.school.name}</TableCell>
                    <TableCell>{billing.insuredStudentsCount}</TableCell>
                    <TableCell>{billing.insurancePercentage}%</TableCell>
                    <TableCell className="font-medium">
                      {brazilianRealFormatter(billing.totalAmount / 100)}
                    </TableCell>
                    <TableCell>{brazilianDateFormatter(billing.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[billing.status] || ''}>
                        {STATUS_LABELS[billing.status] || billing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onViewDetails && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onViewDetails(billing.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver Detalhes</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {billing.invoiceUrl && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" asChild>
                                  <a
                                    href={billing.invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Baixar Boleto</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {meta && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {meta.page} de {meta.lastPage}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(meta.page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.lastPage}
                  onClick={() => setPage(meta.page + 1)}
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

export function InsuranceBillingsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-[180px]" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
