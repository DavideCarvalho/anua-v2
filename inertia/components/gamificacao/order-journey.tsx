import { cn } from '../../lib/utils'
import { Package, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react'

type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELED'
  | 'REJECTED'

const steps = [
  { key: 'APPROVED', label: 'Aprovado', icon: CheckCircle2 },
  { key: 'PREPARING', label: 'Preparando', icon: Package },
  { key: 'READY', label: 'Pronto', icon: Truck },
  { key: 'DELIVERED', label: 'Entregue', icon: CheckCircle2 },
] as const

const statusOrder: Record<string, number> = {
  PENDING_PAYMENT: -1,
  APPROVED: 0,
  PREPARING: 1,
  READY: 2,
  DELIVERED: 3,
  CANCELED: -2,
  REJECTED: -2,
}

interface OrderJourneyProps {
  status: OrderStatus
}

export function OrderJourney({ status }: OrderJourneyProps) {
  const currentIdx = statusOrder[status] ?? -1
  const isCanceled = status === 'CANCELED' || status === 'REJECTED'

  if (isCanceled) {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-destructive">
        <XCircle className="size-4" />
        {status === 'CANCELED' ? 'Pedido cancelado' : 'Pedido recusado'}
      </div>
    )
  }

  if (status === 'PENDING_PAYMENT') {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-gf-gold-dark">
        <Clock className="size-4" />
        Aguardando pagamento
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const reached = i <= currentIdx
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                'flex size-7 items-center justify-center rounded-full transition-colors',
                reached ? 'bg-gf-primary text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="size-3.5" />
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn('h-0.5 w-4 sm:w-6', i < currentIdx ? 'bg-gf-primary' : 'bg-muted')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
