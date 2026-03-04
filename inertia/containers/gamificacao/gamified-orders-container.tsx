import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Mail, Package } from 'lucide-react'
import type { Route } from '@tuyau/core/types'
import { OrderJourney } from '../../components/gamificacao/order-journey'
import { staggerContainer, fadeUp } from '../../lib/gamified-animations'
import { api } from '~/lib/api'
import { formatCurrency } from '../../lib/utils'

type MyOrdersResponse = Route.Response<'api.v1.marketplace.orders.index'>
type Order = NonNullable<MyOrdersResponse>['data'][number]

export function GamifiedOrdersContainer() {
  const { data, isLoading } = useQuery(
    api.api.v1.marketplace.orders.index.queryOptions({})
  )

  const orders: Order[] = data?.data ?? []

  if (isLoading) {
    return (
      <div className="py-12 text-center font-body text-muted-foreground">
        Verificando correio...
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gf-purple/30 py-16 text-center">
        <Mail className="size-12 text-gf-purple/40" />
        <h3 className="mt-4 font-display text-lg font-semibold">
          Nenhuma encomenda ainda!
        </h3>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Suas encomendas aparecerão aqui quando você fizer pedidos
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {orders.map((order) => (
        <motion.div
          key={order.id}
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-gf-purple/20 bg-white shadow-sm dark:border-gf-purple/10 dark:bg-gf-navy/60"
        >
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-gf-purple" />
                <span className="font-display text-sm font-bold">
                  {order.store?.name ?? 'Pedido'}
                </span>
              </div>
              <span className="font-body text-xs text-muted-foreground">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('pt-BR')
                  : ''}
              </span>
            </div>

            {order.items && (
              <div className="mb-3 space-y-1">
                {order.items.map((item, i) => (
                  <p key={i} className="font-body text-sm text-muted-foreground">
                    {item.quantity}x {item.name ?? item.storeItem?.name ?? 'Item'}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <OrderJourney status={order.status} />
              <span className="font-display text-sm font-bold text-gf-primary">
                {formatCurrency(order.totalAmount ?? 0)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
