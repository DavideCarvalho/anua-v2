import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

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

import { api } from '~/lib/api'
import type { Route } from '@tuyau/core/types'

type PrintRequestsListResponse = Route.Response<'api.v1.print_requests.list_print_requests'>
type PrintRequestItem = PrintRequestsListResponse['data'][number]
type PrintRequestsQuery = Route.Query<'api.v1.print_requests.list_print_requests'>
type PrintRequestStatus = NonNullable<PrintRequestsQuery['statuses']>[number]

const STATUS_OPTIONS: { label: string; value: PrintRequestStatus }[] = [
  { label: 'Pedido', value: 'REQUESTED' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Rejeitado', value: 'REJECTED' },
  { label: 'Impresso', value: 'PRINTED' },
  { label: 'Revisão', value: 'REVIEW' },
]

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Pedido',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  PRINTED: 'Impresso',
  REVIEW: 'Revisão',
}

export function PrintRequestTable({
  onView,
  onReview,
  onMarkPrinted,
}: {
  onView: (id: string) => void
  onReview: (id: string) => void
  onMarkPrinted: (id: string) => void
}) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<PrintRequestStatus | undefined>()

  const { data, isLoading, isError } = useQuery(
    api.api.v1.printRequests.listPrintRequests.queryOptions({
      query: {
        page,
        limit: 10,
        statuses: statusFilter ? [statusFilter] : undefined,
      },
    })
  )

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="text-center text-destructive py-8">
        Erro ao carregar solicitações de impressão
      </div>
    )
  }

  const statusBadge = useMemo(
    () => ({
      REQUESTED: 'outline',
      APPROVED: 'default',
      REJECTED: 'outline',
      PRINTED: 'default',
      REVIEW: 'outline',
    }),
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) =>
              setStatusFilter(
                value === 'all'
                  ? undefined
                  : STATUS_OPTIONS.find((status) => status.value === value)?.value
              )
            }
          >
            <SelectTrigger className="w-[200px]">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impressão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: PrintRequestItem) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{String(row.dueDate).slice(0, 10)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (statusBadge as Record<string, string>)[row.status] === 'default'
                          ? 'default'
                          : 'outline'
                      }
                    >
                      {STATUS_LABELS[row.status as string] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.frontAndBack ? 'Frente e verso' : 'Apenas frente'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onView(row.id)}>
                        Ver
                      </Button>
                      {row.status === 'REVIEW' && (
                        <Button variant="outline" size="sm" onClick={() => onReview(row.id)}>
                          Revisar
                        </Button>
                      )}
                      {row.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => onMarkPrinted(row.id)}>
                          Marcar impresso
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {meta && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {meta.currentPage} de {meta.lastPage}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage(meta.currentPage - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage(meta.currentPage + 1)}
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
