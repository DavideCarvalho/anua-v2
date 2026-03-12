'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useRouter } from '@adonisjs/inertia/react'
import { Calendar, Clock, Text, User } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from '~/components/ui/sonner'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useCalendar } from '~/components/calendar-context'
import { AddEditEventDialog } from '~/components/add-edit-event-dialog'
import { formatTime } from '~/components/helpers'
import type { IEvent } from '~/components/interfaces'
import { NewAssignmentModal } from '~/containers/turma/new-assignment-modal'
import { NewExamModal } from '~/containers/turma/new-exam-modal'
import { useAuthUser } from '~/stores/auth_store'

interface IProps {
  event: IEvent
  children: ReactNode
}

export function EventDetailsDialog({ event, children }: IProps) {
  const router = useRouter()
  const user = useAuthUser()
  const startDate = parseISO(event.startDate)
  const endDate = parseISO(event.endDate)
  const { use24HourFormat, removeEvent } = useCalendar()
  const isAssessmentEvent = event.color === 'blue' || event.color === 'red'
  const isPedagogicalEvent = Boolean(event.sourceType)
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false)
  const [editExamOpen, setEditExamOpen] = useState(false)

  const handleEdit = () => {
    if (event.sourceType === 'ASSIGNMENT' && event.sourceId) {
      setEditAssignmentOpen(true)
      return
    }

    if (event.sourceType === 'EXAM' && event.sourceId) {
      setEditExamOpen(true)
      return
    }

    if (event.sourceType === 'EVENT' && event.sourceId) {
      router.visit({ route: 'web.escola.eventos.editar', routeParams: { eventId: event.sourceId } })
    }
  }

  const deleteEvent = (eventId: number) => {
    try {
      removeEvent(eventId)
      toast.success('Evento removido com sucesso.')
    } catch {
      toast.error('Erro ao remover evento.')
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4 p-4">
              <div className="flex items-start gap-2">
                <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isAssessmentEvent ? 'Professor' : 'Responsável'}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Início</p>
                  <p className="text-sm text-muted-foreground">
                    {format(startDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    <span className="mx-1">às</span>
                    {formatTime(parseISO(event.startDate), use24HourFormat)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Fim</p>
                  <p className="text-sm text-muted-foreground">
                    {format(endDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    <span className="mx-1">às</span>
                    {formatTime(parseISO(event.endDate), use24HourFormat)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Descrição</p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            {isPedagogicalEvent ? (
              <Button
                variant="outline"
                onClick={handleEdit}
                disabled={event.readonly || !event.sourceId}
              >
                Editar
              </Button>
            ) : (
              <>
                <AddEditEventDialog event={event}>
                  <Button variant="outline">Editar</Button>
                </AddEditEventDialog>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteEvent(event.id)
                  }}
                >
                  Excluir
                </Button>
              </>
            )}
          </div>
          <DialogClose />
        </DialogContent>
      </Dialog>

      {event.sourceType === 'ASSIGNMENT' && event.sourceId ? (
        <NewAssignmentModal
          classId=""
          academicPeriodId=""
          open={editAssignmentOpen}
          assignmentId={event.sourceId}
          mode="edit"
          onOpenChange={setEditAssignmentOpen}
          user={user}
        />
      ) : null}

      {event.sourceType === 'EXAM' && event.sourceId ? (
        <NewExamModal
          classId=""
          academicPeriodId=""
          open={editExamOpen}
          examId={event.sourceId}
          mode="edit"
          onOpenChange={setEditExamOpen}
          user={user}
        />
      ) : null}
    </>
  )
}
