import { Link } from '@inertiajs/react'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'

interface EventDetails {
  id: string
  title: string
  description: string | null
  type: string
  startDate: string
  endDate: string | null
  startTime: string | null
  endTime: string | null
  location: string | null
  isAllDay: boolean
  requiresParentalConsent: boolean
  hasAdditionalCosts?: boolean
  additionalCostAmount?: number | null
  additionalCostInstallments?: number | null
}

interface EventDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EventDetails | null
}

export function EventDetailsModal({ open, onOpenChange, event }: EventDetailsModalProps) {
  if (!event) {
    return null
  }

  const startsAt = new Date(event.startDate)
  const endsAt = event.endDate ? new Date(event.endDate) : null

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>Detalhes do evento</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Início:</strong> {dateFormatter.format(startsAt)}
          </p>
          <p>
            <strong>Término:</strong> {endsAt ? dateFormatter.format(endsAt) : '-'}
          </p>
          <p>
            <strong>Horário:</strong>{' '}
            {event.isAllDay
              ? 'Dia inteiro'
              : event.startTime || event.endTime
                ? `${event.startTime || '--:--'} até ${event.endTime || '--:--'}`
                : 'Não informado'}
          </p>
          <p>
            <strong>Local:</strong> {event.location || 'Não informado'}
          </p>
          <p>
            <strong>Autorização:</strong> {event.requiresParentalConsent ? 'Sim' : 'Não'}
          </p>
          <p>
            <strong>Evento pago:</strong>{' '}
            {event.hasAdditionalCosts
              ? `Sim (R$ ${event.additionalCostAmount ?? '-'} em até ${event.additionalCostInstallments || 1}x)`
              : 'Não'}
          </p>
          {event.description && (
            <p>
              <strong>Descrição:</strong> {event.description}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button asChild>
            <Link href={`/escola/eventos/${event.id}/editar`}>Editar evento</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
