import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  X,
  Truck,
  Loader2,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  useOwnOrdersQueryOptions,
  type OwnOrdersResponse,
} from '../hooks/queries/use_store_owner'
import {
  useApproveOrder,
  useRejectOrder,
  useDeliverOrder,
  useCancelOrder,
} from '../hooks/mutations/use_store_owner_mutations'
import { formatCurrency } from '../lib/utils'
import { toast } from 'sonner'

type Order = NonNullable<OwnOrdersResponse>['data'][number]

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pagamento Pendente',
  PENDING_APPROVAL: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  PREPARING: 'Preparando',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  REJECTED: 'Rejeitado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING_PAYMENT: 'outline',
  PENDING_APPROVAL: 'secondary',
  APPROVED: 'default',
  PREPARING: 'default',
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

  const approveOrder = useApproveOrder()
  const rejectOrder = useRejectOrder()
  const deliverOrder = useDeliverOrder()
  const cancelOrder = useCancelOrder()

  const isPending =
    approveOrder.isPending ||
    rejectOrder.isPending ||
    deliverOrder.isPending ||
    cancelOrder.isPending

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(order.id)
      toast.success('Pedido aprovado com sucesso!')
    } catch {
      toast.error('Erro ao aprovar pedido')
    }
  }

  const handleReject = async () => {
    try {
      await rejectOrder.mutateAsync({ id: order.id, reason: rejectReason })
      toast.success('Pedido rejeitado')
      setRejectDialogOpen(false)
      setRejectReason('')
    } catch {
      toast.error('Erro ao rejeitar pedido')
    }
  }

  const handleDeliver = async () => {
    try {
      await deliverOrder.mutateAsync({ id: order.id, deliveredAt })
      toast.success('Pedido marcado como entregue!')
      setDeliverDialogOpen(false)
    } catch {
      toast.error('Erro ao atualizar pedido')
    }
  }

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync({ id: order.id, reason: cancelReason })
      toast.success('Pedido cancelado')
      setCancelDialogOpen(false)
      setCancelReason('')
    } catch {
      toast.error('Erro ao cancelar pedido')
    }
  }

  const canApprove = order.status === 'PENDING_APPROVAL'
  const canReject = order.status === 'PENDING_APPROVAL'
  const canDeliver = ['APPROVED', 'PREPARING', 'READY'].includes(order.status)
  const canCancel = ['APPROVED', 'PREPARING', 'READY'].includes(order.status)

  if (!canApprove && !canReject && !canDeliver && !canCancel) {
    return null
  }

  return (
    <>
      <div className="flex gap-1">
        {canApprove && (
          <Button
            size="sm"
            variant="default"
            onClick={handleApprove}
            disabled={isPending}
          >
            {approveOrder.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Check className="h-3 w-3 mr-1" />}
            Aprovar
          </Button>
        )}
        {canReject && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            disabled={isPending}
          >
            <X className="h-3 w-3 mr-1" />
            Rejeitar
          </Button>
        )}
        {canDeliver && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeliverDialogOpen(true)}
            disabled={isPending}
          >
            <Truck className="h-3 w-3 mr-1" />
            Entregar
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setCancelDialogOpen(true)}
            disabled={isPending}
          >
            <X className="h-3 w-3 mr-1" />
            Cancelar
          </Button>
        )}
      </div>

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
              disabled={!rejectReason.trim() || rejectOrder.isPending}
            >
              {rejectOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
            <Label htmlFor={`deliveredAt-${order.id}`}>Data de entrega</Label>
            <Input
              id={`deliveredAt-${order.id}`}
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
              disabled={deliverOrder.isPending}
            >
              {deliverOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
              disabled={!cancelReason.trim() || cancelOrder.isPending}
            >
              {cancelOrder.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Cancelar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function StoreOwnerOrdersContainer() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(
    useOwnOrdersQueryOptions({
      status: statusFilter || undefined,
      search: search || undefined,
    })
  )

  const orders = data?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
        <CardDescription>Todos os pedidos da sua loja</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar por aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
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

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !orders.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.student?.name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.map((item) => (
                        <div key={item.id}>
                          {item.quantity}x {item.storeItem?.name ?? 'Item'}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.totalMoney)}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[order.status] ?? 'outline'}>
                      {STATUS_LABELS[order.status] ?? order.status}
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
