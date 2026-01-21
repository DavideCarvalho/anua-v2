import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'

import { EventsCalendar, EventsCalendarSkeleton } from '../../containers/events/events-calendar'
import { NewEventModal } from '../../containers/events/new-event-modal'

interface PageProps {
  schoolId: string
  [key: string]: any
}

export default function EventosPage() {
  const { schoolId } = usePage<PageProps>().props
  const [newModalOpen, setNewModalOpen] = useState(false)

  return (
    <EscolaLayout>
      <Head title="Eventos" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Calendario de Eventos</h1>
          <Button onClick={() => setNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        </div>

        <Suspense fallback={<EventsCalendarSkeleton />}>
          <EventsCalendar schoolId={schoolId} />
        </Suspense>

        <NewEventModal
          schoolId={schoolId}
          open={newModalOpen}
          onOpenChange={setNewModalOpen}
        />
      </div>
    </EscolaLayout>
  )
}
