import { Link } from '@adonisjs/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { FileSignature, ShieldCheck } from 'lucide-react'

import { api } from '~/lib/api'
import { Badge } from '../../components/ui/badge'
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

function ConsentSummary({ eventId }: { eventId: string }) {
  const { data } = useQuery({
    ...api.api.v1.events.getSignatureTemplate.queryOptions({ params: { eventId } }),
    staleTime: 60 * 1000,
  })
  const hasTemplate = !!data?.template

  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
      <div className="flex items-center gap-2">
        {hasTemplate ? (
          <Badge variant="outline" className="border-primary text-primary">
            <FileSignature className="mr-1 h-3 w-3" />
            Termo assinado em PDF
          </Badge>
        ) : (
          <Badge variant="outline">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Aprovação simples
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {hasTemplate
          ? 'Responsáveis assinam o PDF via Autentique. Status individual aparece em "Ver autorizações".'
          : 'Responsáveis clicam Aprovar/Negar com observação. Sem PDF assinado.'}
      </p>
    </div>
  )
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
          {event.requiresParentalConsent && <ConsentSummary eventId={event.id} />}
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
          {event.requiresParentalConsent && (
            <Button asChild variant="secondary">
              <Link route="web.escola.eventos.autorizacoes" routeParams={{ eventId: event.id }}>
                Ver autorizações
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link route="web.escola.eventos.editar" routeParams={{ eventId: event.id }}>
              Editar evento
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
