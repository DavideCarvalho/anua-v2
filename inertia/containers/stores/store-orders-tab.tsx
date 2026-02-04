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
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '../../lib/utils'

interface StoreOrdersTabProps {
  storeId: string
}

async function fetchStoreOrders(storeId: string) {
  const response = await fetch(`/api/v1/store-orders?storeId=${storeId}`, {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  return response.json()
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: 'Aguardando Pgto',
  PENDING_APPROVAL: 'Aguardando Aprovacao',
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

export function StoreOrdersTab({ storeId }: StoreOrdersTabProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['storeOrders', storeId],
    queryFn: () => fetchStoreOrders(storeId),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : !orders?.data?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pedido encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.student?.user?.name ?? '\u2014'}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
