import { Head, usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { Suspense } from 'react'
import { ArrowLeft, Shield } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'

import {
  EventConsentsTracking,
  EventConsentsTrackingSkeleton,
} from '../../../containers/events/event-consents-tracking'

interface PageProps {
  eventId: string
  [key: string]: any
}

export default function EventoAutorizacoesPage() {
  const { eventId } = usePage<PageProps>().props

  return (
    <EscolaLayout>
      <Head title="Autorizações do Evento" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.eventos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Autorizações Parentais
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o status das autorizações dos responsáveis
            </p>
          </div>
        </div>

        <Suspense fallback={<EventConsentsTrackingSkeleton />}>
          <EventConsentsTracking eventId={eventId} />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
