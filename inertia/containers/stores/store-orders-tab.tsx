import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Textarea } from '../../components/ui/textarea'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'
import { useStoreOrdersQueryOptions } from '../../hooks/queries/use_stores'
import {
  useApproveStoreOrder,
  useRejectStoreOrder,
  useDeliverStoreOrder,
  useCancelStoreOrder,
} from '../../hooks/mutations/use_store_order_actions'
import { Label } from '../../components/ui/label'
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryStates, parseAsString } from 'nuqs'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

interface StoreOrdersTabProps {
  storeId: string
}

type StoreOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELED'
  | 'REJECTED'

type StoreOrderPaymentMode = 'IMMEDIATE' | 'DEFERRED'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalMoney: number
  paymentMode: 'IMMEDIATE' | 'DEFERRED' | null
  student?: {
    user?: {
      name?: string
    }
  }
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando Pgto',
  PENDING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  REJECTED: 'Rejeitado',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING_PAYMENT: 'outline',
  PENDING_APPROVAL: 'secondary',
  APPROVED: 'default',
  PREPARING: 'secondary',
  READY: 'default',
  DELIVERED: 'default',
  CANCELED: 'destructive',
  REJECTED: 'destructive',
}

function OrderActions({ order }: { order: Order }) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false)
  const [deliveredAt, setDeliveredAt] = useState(() => new Date().toISOString().split('T')[0])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const approveMutation = useApproveStoreOrder()
  const rejectMutation = useRejectStoreOrder()
  const deliverMutation = useDeliverStoreOrder()
  const cancelMutation = useCancelStoreOrder()

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deliverMutation.isPending ||
    cancelMutation.isPending

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(order.id)
      toast.success('Pedido aprovado com sucesso!')
    } catch {
      toast.error('Erro ao aprovar pedido')
    }
  }

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ id: order.id, reason: rejectReason })
      toast.success('Pedido rejeitado')
      setRejectDialogOpen(false)
      setRejectReason('')
    } catch {
      toast.error('Erro ao rejeitar pedido')
    }
  }

  const handleDeliver = async () => {
    try {
      await deliverMutation.mutateAsync({ id: order.id, deliveredAt })
      toast.success('Pedido marcado como entregue!')
      setDeliverDialogOpen(false)
    } catch {
      toast.error('Erro ao atualizar pedido')
    }
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ id: order.id, reason: cancelReason })
      toast.success('Pedido cancelado')
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch {
      toast.error('Erro ao cancelar pedido')
    }
  }

  // Determina quais ações estão disponíveis baseado no status
  const canApprove = ['PENDING_PAYMENT', 'PENDING_APPROVAL'].includes(order.status)
  const canReject = ['PENDING_PAYMENT', 'PENDING_APPROVAL'].includes(order.status)
  const canDeliver = ['APPROVED', 'PREPARING', 'READY'].includes(order.status)
  const canCancel = ['APPROVED', 'PREPARING', 'READY'].includes(order.status)

  // Se não há ações disponíveis, não mostra o dropdown
  if (!canApprove && !canReject && !canDeliver && !canCancel) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canApprove && (
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Aprovar Pedido
            </DropdownMenuItem>
          )}
          {canDeliver && (
            <DropdownMenuItem onClick={() => setDeliverDialogOpen(true)}>
              <Truck className="h-4 w-4 mr-2 text-green-600" />
              Marcar como Entregue
            </DropdownMenuItem>
          )}
          {canReject && (
            <DropdownMenuItem onClick={() => setRejectDialogOpen(true)}>
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Rejeitar Pedido
            </DropdownMenuItem>
          )}
          {canCancel && (
            <DropdownMenuItem onClick={() => setCancelDialogOpen(true)}>
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Cancelar Pedido
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Pedido</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do pedido {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Rejeitar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deliverDialogOpen} onOpenChange={setDeliverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Entregue</DialogTitle>
            <DialogDescription>
              Informe a data de entrega do pedido {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="deliveredAt">Data de entrega</Label>
            <Input
              id="deliveredAt"
              type="date"
              value={deliveredAt}
              onChange={(e) => setDeliveredAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeliverDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeliver}
              disabled={deliverMutation.isPending}
            >
              {deliverMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Pedido</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento do pedido {order.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo do cancelamento..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelMutation.isPending}
            >
              {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cancelar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function StoreOrdersTab({ storeId }: StoreOrdersTabProps) {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    status: parseAsString,
    paymentMode: parseAsString,
  })

  const { search, status, paymentMode } = filters
  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  useEffect(() => {
    setFilters({ search: debouncedSearch ? debouncedSearch : null })
  }, [debouncedSearch, setFilters])

  const { data: orders, isLoading } = useQuery(
    useStoreOrdersQueryOptions({
      storeId,
      status: (status as StoreOrderStatus | null) || undefined,
      paymentMode: (paymentMode as StoreOrderPaymentMode | null) || undefined,
      search: search || undefined,
    })
  )

  const ordersList = orders?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Input
              placeholder="Buscar por aluno..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <Select
              value={paymentMode ?? 'all'}
              onValueChange={(value) =>
                setFilters({
                  paymentMode: value === 'all' ? null : (value as StoreOrderPaymentMode),
                })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="IMMEDIATE">Imediato</SelectItem>
                <SelectItem value="DEFERRED">Na Fatura</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status ?? 'all'}
              onValueChange={(value) =>
                setFilters({ status: value === 'all' ? null : (value as StoreOrderStatus) })
              }
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Aguardando Pgto</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Aguardando Aprovação</SelectItem>
                <SelectItem value="APPROVED">Aprovado</SelectItem>
                <SelectItem value="PREPARING">Preparando</SelectItem>
                <SelectItem value="READY">Pronto</SelectItem>
                <SelectItem value="DELIVERED">Entregue</SelectItem>
                <SelectItem value="CANCELED">Cancelado</SelectItem>
                <SelectItem value="REJECTED">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !ordersList.length ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum pedido encontrado</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersList.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>{order.student?.user?.name ?? '—'}</TableCell>
                  <TableCell>{formatCurrency(order.totalMoney)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.paymentMode === 'IMMEDIATE' ? 'Imediato' : 'Na Fatura'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[order.status] ?? 'outline'}>
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <OrderActions order={order} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
