import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'

import { useEventQueryOptions } from '../../hooks/queries/use-event'
import { useUpdateEventMutation } from '../../hooks/mutations/use-update-event'

const EventType = {
  ACADEMIC_EVENT: 'ACADEMIC_EVENT',
  EXAM: 'EXAM',
  ASSIGNMENT: 'ASSIGNMENT',
  FIELD_TRIP: 'FIELD_TRIP',
  PARENTS_MEETING: 'PARENTS_MEETING',
  CULTURAL_EVENT: 'CULTURAL_EVENT',
  SPORTS_EVENT: 'SPORTS_EVENT',
  HOLIDAY: 'HOLIDAY',
  OTHER: 'OTHER',
} as const

const EventStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  POSTPONED: 'POSTPONED',
} as const

const EventPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

const EventVisibility = {
  PUBLIC: 'PUBLIC',
  SCHOOL_ONLY: 'SCHOOL_ONLY',
  STAFF_ONLY: 'STAFF_ONLY',
  PARENTS_ONLY: 'PARENTS_ONLY',
  STUDENTS_ONLY: 'STUDENTS_ONLY',
} as const

const formSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(255),
  description: z.string().optional(),
  type: z.string(),
  status: z.string(),
  visibility: z.string(),
  priority: z.string(),
  startsAt: z.string().min(1, 'Data de inicio e obrigatoria'),
  endsAt: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean(),
  location: z.string().max(255).optional(),
  isOnline: z.boolean(),
  onlineUrl: z.string().url('URL invalida').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof formSchema>

interface EditEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}

export function EditEventModal({ open, onOpenChange, eventId }: EditEventModalProps) {
  const { data: event } = useSuspenseQuery(useEventQueryOptions({ id: eventId }))
  const updateEventMutation = useUpdateEventMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      type: EventType.ACADEMIC_EVENT,
      status: EventStatus.DRAFT,
      visibility: EventVisibility.SCHOOL_ONLY,
      priority: EventPriority.NORMAL,
      startsAt: '',
      endsAt: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
      location: '',
      isOnline: false,
      onlineUrl: '',
    },
  })

  useEffect(() => {
    if (event) {
      const startsAt = new Date(event.startsAt)
      const endsAt = event.endsAt ? new Date(event.endsAt) : null

      form.reset({
        title: event.title,
        description: event.description || '',
        type: event.type,
        status: event.status,
        visibility: event.visibility,
        priority: event.priority,
        startsAt: startsAt.toISOString().split('T')[0],
        endsAt: endsAt ? endsAt.toISOString().split('T')[0] : '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        isAllDay: event.isAllDay,
        location: event.location || '',
        isOnline: event.isOnline,
        onlineUrl: event.onlineUrl || '',
      })
    }
  }, [event, form])

  const onSubmit = async (values: FormValues) => {
    toast.promise(
      updateEventMutation.mutateAsync({
        params: { id: eventId },
        ...values,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
        onlineUrl: values.onlineUrl || undefined,
      } as any),
      {
        loading: 'Atualizando evento...',
        success: () => {
          onOpenChange(false)
          return 'Evento atualizado com sucesso!'
        },
        error: 'Erro ao atualizar evento',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>Atualize as informacoes do evento abaixo.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reuniao de Pais" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o evento..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evento *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EventType.ACADEMIC_EVENT}>Evento Academico</SelectItem>
                      <SelectItem value={EventType.EXAM}>Prova</SelectItem>
                      <SelectItem value={EventType.ASSIGNMENT}>Trabalho</SelectItem>
                      <SelectItem value={EventType.FIELD_TRIP}>Passeio</SelectItem>
                      <SelectItem value={EventType.PARENTS_MEETING}>Reuniao de Pais</SelectItem>
                      <SelectItem value={EventType.CULTURAL_EVENT}>Evento Cultural</SelectItem>
                      <SelectItem value={EventType.SPORTS_EVENT}>Evento Esportivo</SelectItem>
                      <SelectItem value={EventType.HOLIDAY}>Feriado</SelectItem>
                      <SelectItem value={EventType.OTHER}>Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EventStatus.DRAFT}>Rascunho</SelectItem>
                        <SelectItem value={EventStatus.PUBLISHED}>Publicado</SelectItem>
                        <SelectItem value={EventStatus.CANCELLED}>Cancelado</SelectItem>
                        <SelectItem value={EventStatus.COMPLETED}>Concluido</SelectItem>
                        <SelectItem value={EventStatus.POSTPONED}>Adiado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EventPriority.LOW}>Baixa</SelectItem>
                        <SelectItem value={EventPriority.NORMAL}>Normal</SelectItem>
                        <SelectItem value={EventPriority.HIGH}>Alta</SelectItem>
                        <SelectItem value={EventPriority.URGENT}>Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibilidade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EventVisibility.PUBLIC}>Publico</SelectItem>
                      <SelectItem value={EventVisibility.SCHOOL_ONLY}>Escola</SelectItem>
                      <SelectItem value={EventVisibility.STAFF_ONLY}>Apenas Equipe</SelectItem>
                      <SelectItem value={EventVisibility.PARENTS_ONLY}>Apenas Responsaveis</SelectItem>
                      <SelectItem value={EventVisibility.STUDENTS_ONLY}>Apenas Alunos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Inicio *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Termino</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isAllDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Dia Inteiro</FormLabel>
                    <FormDescription>Este evento dura o dia todo</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch('isAllDay') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Inicio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora de Termino</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Auditorio Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isOnline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Evento Online</FormLabel>
                    <FormDescription>Este evento sera realizado online</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('isOnline') && (
              <FormField
                control={form.control}
                name="onlineUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Evento Online</FormLabel>
                    <FormControl>
                      <Input placeholder="https://meet.google.com/..." type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateEventMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateEventMutation.isPending}>
                {updateEventMutation.isPending ? 'Salvando...' : 'Salvar Alteracoes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
