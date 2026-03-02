import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Check, X, Truck, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

import { api } from '~/lib/api'

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

interface StoreOrdersTableProps {
  schoolId: string
  status?:
    | 'PENDING_APPROVAL'
    | 'REJECTED'
    | 'APPROVED'
    | 'PENDING_PAYMENT'
    | 'PREPARING'
    | 'READY'
    | 'DELIVERED'
    | 'CANCELED'
}

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    icon: React.ReactNode
  }
> = {
  PENDING_APPROVAL: {
    label: 'Aguardando',
    variant: 'secondary',
    icon: <Clock className="h-3 w-3" />,
  },
  PENDING_PAYMENT: {
    label: 'Pend. Pagamento',
    variant: 'outline',
    icon: <AlertCircle className="h-3 w-3" />,
  },
  APPROVED: { label: 'Aprovado', variant: 'default', icon: <Check className="h-3 w-3" /> },
  PREPARING: { label: 'Preparando', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  READY: { label: 'Pronto', variant: 'default', icon: <Check className="h-3 w-3" /> },
  DELIVERED: { label: 'Entregue', variant: 'default', icon: <Truck className="h-3 w-3" /> },
  CANCELED: { label: 'Cancelado', variant: 'destructive', icon: <X className="h-3 w-3" /> },
  REJECTED: { label: 'Rejeitado', variant: 'destructive', icon: <X className="h-3 w-3" /> },
}

export function StoreOrdersTable({ schoolId, status }: StoreOrdersTableProps) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    api.api.v1.storeOrders.index.queryOptions({ query: { schoolId, status } })
  )
  const approveMutation = useMutation(api.api.v1.storeOrders.approve.mutationOptions())
  const rejectMutation = useMutation(api.api.v1.storeOrders.reject.mutationOptions())
  const deliverMutation = useMutation(api.api.v1.storeOrders.deliver.mutationOptions())

  const orders = data?.data ?? []

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: ['storeOrders'] })
      toast.success('Pedido aprovado!')
    } catch {
      toast.error('Erro ao aprovar pedido')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ params: { id }, body: { reason: 'Rejeitado' } })
      queryClient.invalidateQueries({ queryKey: ['storeOrders'] })
      toast.success('Pedido rejeitado')
    } catch {
      toast.error('Erro ao rejeitar pedido')
    }
  }

  const handleDeliver = async (id: string) => {
    try {
      await deliverMutation.mutateAsync({ params: { id } })
      queryClient.invalidateQueries({ queryKey: ['storeOrders'] })
      toast.success('Pedido marcado como entregue!')
    } catch {
      toast.error('Erro ao entregar pedido')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Carregando pedidos...</p>
        </CardContent>
      </Card>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum pedido encontrado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Os pedidos dos alunos aparecerão aqui
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos da Loja</CardTitle>
        <CardDescription>{orders.length} pedido(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-center">Pontos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.PENDING_APPROVAL

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.student?.user?.name || '-'}</TableCell>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center font-medium">{order.totalPoints} pts</TableCell>
                  <TableCell>
                    <Badge variant={config.variant} className="gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.createdAt
                      ? formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {order.status === 'PENDING_APPROVAL' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleApprove(order.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(order.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {(order.status === 'APPROVED' || order.status === 'READY') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeliver(order.id)}
                          disabled={deliverMutation.isPending}
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Entregar
                        </Button>
                      )}
                    </div>
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
