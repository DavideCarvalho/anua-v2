import { useSuspenseQuery } from '@tanstack/react-query'
import { Wallet, Check, Clock, AlertTriangle, Building } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { useCanteenMonthlyTransfersQueryOptions } from '../../hooks/queries/use-canteen-monthly-transfers'
import { useUpdateCanteenMonthlyTransferStatus } from '../../hooks/mutations/use-canteen-reservation-mutations'

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
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  PENDING: { label: 'Pendente', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  PROCESSING: { label: 'Processando', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  COMPLETED: { label: 'Concluído', variant: 'default', icon: <Check className="h-3 w-3" /> },
  FAILED: { label: 'Falhou', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
}

export function MonthlyTransfersTable({ canteenId }: MonthlyTransfersTableProps) {
  const { data } = useSuspenseQuery(useCanteenMonthlyTransfersQueryOptions({ canteenId }))
  const updateStatusMutation = useUpdateCanteenMonthlyTransferStatus()

  const transfers = Array.isArray(data) ? data : data?.data || []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
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
            {transfers.map((transfer: any) => {
              const config = statusConfig[transfer.status] || statusConfig.PENDING

              return (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {transfer.canteen?.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {transfer.month}/{transfer.year}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transfer.totalAmount || 0)}
                  </TableCell>
                  <TableCell className="text-center">
                    {transfer.transactionCount || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
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
                          updateStatusMutation.mutate({
                            id: transfer.id,
                            status: 'COMPLETED',
                          })
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
