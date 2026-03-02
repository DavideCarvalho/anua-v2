import { useQuery } from '@tanstack/react-query'
import { Wallet, Check, Clock, AlertTriangle, Building } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '../../lib/utils'

import type { Route } from '@tuyau/core/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'

type CanteenMonthlyTransfersResponse = Route.Response<'api.v1.canteen_monthly_transfers.index'>

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

interface MonthlyTransfersTableProps {
  canteenId?: string
}

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: LucideIcon
  }
> = {
  PENDING: { label: 'Pendente', variant: 'secondary', icon: Clock },
  TRANSFERRED: { label: 'Concluído', variant: 'default', icon: Check },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'destructive',
    icon: AlertTriangle,
  },
}

type MonthlyTransfer = CanteenMonthlyTransfersResponse['data'][number]

export function MonthlyTransfersTable({ canteenId }: MonthlyTransfersTableProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error } = useQuery(
    api.api.v1.canteenMonthlyTransfers.index.queryOptions({
      query: { canteenId },
    })
  )
  const updateStatusMutation = useMutation(
    api.api.v1.canteenMonthlyTransfers.updateStatus.mutationOptions()
  )

  const transfers: MonthlyTransfer[] = data?.data ?? []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Carregando transferências...
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold">Não foi possível carregar as transferências</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Tente novamente em instantes.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhuma transferência encontrada</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            As transferências mensais da cantina aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferências Mensais</CardTitle>
        <CardDescription>{transfers.length} transferência(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cantina</TableHead>
              <TableHead>Mês/Ano</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-center">Transações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transfers.map((transfer) => {
              const config = statusConfig[transfer.status] || statusConfig.PENDING
              const StatusIcon = config.icon

              return (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{transfer.canteen?.name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transfer.month}/{transfer.year}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transfer.totalAmount || 0)}
                  </TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transfer.createdAt
                      ? format(new Date(transfer.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {transfer.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatusMutation.mutate(
                            {
                              params: { id: transfer.id },
                              body: { status: 'TRANSFERRED' },
                            },
                            {
                              onSuccess: () =>
                                queryClient.invalidateQueries({
                                  queryKey: ['canteen-monthly-transfers'],
                                }),
                            }
                          )
                        }
                      >
                        Marcar Concluído
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
