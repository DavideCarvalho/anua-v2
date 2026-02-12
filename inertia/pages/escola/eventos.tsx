import { Head, Link, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'

import { EventsCalendar, EventsCalendarSkeleton } from '../../containers/events/events-calendar'

interface PageProps {
  schoolId: string
  [key: string]: any
}

export default function EventosPage() {
  const { schoolId } = usePage<PageProps>().props

  return (
    <EscolaLayout>
      <Head title="Eventos" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendario de Eventos</h1>
          <Button asChild>
            <Link href="/escola/eventos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>

        <Suspense fallback={<EventsCalendarSkeleton />}>
          <EventsCalendar schoolId={schoolId} />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
