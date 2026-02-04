import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  X,
  ChefHat,
  PackageCheck,
  Truck,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useOwnOrdersQueryOptions } from '../hooks/queries/use_store_owner'
import {
  useApproveOrder,
  useRejectOrder,
  useMarkPreparing,
  useMarkReady,
  useDeliverOrder,
} from '../hooks/mutations/use_store_owner_mutations'
import { formatCurrency } from '../lib/utils'

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

export function StoreOwnerOrdersContainer() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery(
    useOwnOrdersQueryOptions({
      status: (statusFilter || undefined) as any,
      search: search || undefined,
    })
  )

  const approveOrder = useApproveOrder()
  const rejectOrder = useRejectOrder()
  const markPreparing = useMarkPreparing()
  const markReady = useMarkReady()
  const deliverOrder = useDeliverOrder()

  const orders = (data as any)?.data ?? []

  function handleReject(orderId: string) {
    const reason = prompt('Motivo da rejeição (opcional):')
    rejectOrder.mutate({ id: orderId, reason: reason ?? undefined })
  }

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
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.student?.name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.items?.map((item: any) => (
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
                    <div className="flex gap-1">
                      {order.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveOrder.mutate(order.id)}
                            disabled={approveOrder.isPending}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(order.id)}
                            disabled={rejectOrder.isPending}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {order.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          onClick={() => markPreparing.mutate(order.id)}
                          disabled={markPreparing.isPending}
                        >
                          <ChefHat className="h-3 w-3 mr-1" />
                          Preparar
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          onClick={() => markReady.mutate(order.id)}
                          disabled={markReady.isPending}
                        >
                          <PackageCheck className="h-3 w-3 mr-1" />
                          Pronto
                        </Button>
                      )}
                      {['APPROVED', 'PREPARING', 'READY'].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deliverOrder.mutate(order.id)}
                          disabled={deliverOrder.isPending}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Entregar
                        </Button>
                      )}
                    </div>
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
