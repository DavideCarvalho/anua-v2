import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  Check,
  X,
  Pencil,
  Trash2,
  ShoppingCart,
  MapPin,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../components/ui/hover-card'

import { usePurchaseRequestsQueryOptions } from '../../hooks/queries/use-purchase-requests'
import { useDeletePurchaseRequestMutation } from '../../hooks/mutations/use-delete-purchase-request'
import { brazilianRealFormatter, brazilianDateFormatter } from '../../lib/formatters'

const STATUS_OPTIONS = [
  { label: 'Pedido', value: 'REQUESTED' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Rejeitado', value: 'REJECTED' },
  { label: 'Comprado', value: 'BOUGHT' },
  { label: 'Chegou', value: 'ARRIVED' },
]

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Pedido',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  BOUGHT: 'Comprado',
  ARRIVED: 'Chegou',
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  REQUESTED: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
  BOUGHT: 'secondary',
  ARRIVED: 'default',
}

interface PurchaseRequestsTableProps {
  schoolId: string
  onEdit: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onMarkBought: (id: string) => void
  onMarkArrived: (id: string) => void
}

export function PurchaseRequestsTable({
  schoolId,
  onEdit,
  onApprove,
  onReject,
  onMarkBought,
  onMarkArrived,
}: PurchaseRequestsTableProps) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  const { data } = useSuspenseQuery(
    usePurchaseRequestsQueryOptions({
      schoolId,
      page,
      limit: 10,
      status: statusFilter,
    } as any)
  )

  const deleteMutation = useDeletePurchaseRequestMutation()

  const rows = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  const handleDelete = async (id: string) => {
    toast.promise(deleteMutation.mutateAsync({ id }), {
      loading: 'Removendo solicitação...',
      success: 'Solicitação removida com sucesso!',
      error: 'Erro ao remover solicitação',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm font-medium">Status</div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
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
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Para quando?</TableHead>
                <TableHead>Data de chegada</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.productName}</TableCell>
                  <TableCell>
                    {row.finalQuantity ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="flex items-center gap-1 cursor-help">
                            {row.finalQuantity > row.quantity ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={
                                row.finalQuantity > row.quantity
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }
                            >
                              {row.finalQuantity}*
                            </span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p>Quantidade pedida: {row.quantity}</p>
                          <p>Quantidade comprada: {row.finalQuantity}</p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      row.quantity
                    )}
                  </TableCell>
                  <TableCell>
                    {row.finalValue ? (
                      <HoverCard>
                        <HoverCardTrigger>
                          <div className="flex items-center gap-1 cursor-help">
                            {row.finalValue > row.value ? (
                              <ArrowUp className="h-4 w-4 text-red-500" />
                            ) : row.finalValue < row.value ? (
                              <ArrowDown className="h-4 w-4 text-green-500" />
                            ) : null}
                            <span
                              className={
                                row.finalValue > row.value
                                  ? 'text-red-500'
                                  : row.finalValue < row.value
                                    ? 'text-green-500'
                                    : ''
                              }
                            >
                              {brazilianRealFormatter(row.finalValue)}*
                            </span>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p>Valor unitário pedido: {brazilianRealFormatter(row.unitValue)}</p>
                          <p>Valor unitário comprado: {brazilianRealFormatter(row.finalUnitValue)}</p>
                          <p>Valor total comprado: {brazilianRealFormatter(row.finalValue)}</p>
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      brazilianRealFormatter(row.value)
                    )}
                  </TableCell>
                  <TableCell>{brazilianDateFormatter(row.dueDate)}</TableCell>
                  <TableCell>
                    {row.arrivalDate
                      ? brazilianDateFormatter(row.arrivalDate)
                      : row.estimatedArrivalDate
                        ? brazilianDateFormatter(row.estimatedArrivalDate)
                        : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[row.status] ?? 'outline'}>
                      {STATUS_LABELS[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(row.status === 'REQUESTED' || row.status === 'REJECTED') && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(row.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDelete(row.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remover</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      {row.status === 'REQUESTED' && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => onReject(row.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Rejeitar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => onApprove(row.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Aprovar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}

                      {row.status === 'APPROVED' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-700"
                                onClick={() => onMarkBought(row.id)}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Marcar como comprado</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {row.status === 'BOUGHT' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-700"
                                onClick={() => onMarkArrived(row.id)}
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Marcar como chegou</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
