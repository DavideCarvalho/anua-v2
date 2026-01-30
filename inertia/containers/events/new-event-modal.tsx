import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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

import { useCreateEventMutation } from '../../hooks/mutations/use_create_event'

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
  type: z.enum([
    EventType.ACADEMIC_EVENT,
    EventType.EXAM,
    EventType.ASSIGNMENT,
    EventType.FIELD_TRIP,
    EventType.PARENTS_MEETING,
    EventType.CULTURAL_EVENT,
    EventType.SPORTS_EVENT,
    EventType.HOLIDAY,
    EventType.OTHER,
  ]),
  visibility: z.enum([
    EventVisibility.PUBLIC,
    EventVisibility.SCHOOL_ONLY,
    EventVisibility.STAFF_ONLY,
    EventVisibility.PARENTS_ONLY,
    EventVisibility.STUDENTS_ONLY,
  ]).default(EventVisibility.SCHOOL_ONLY),
  priority: z.enum([
    EventPriority.LOW,
    EventPriority.NORMAL,
    EventPriority.HIGH,
    EventPriority.URGENT,
  ]).default(EventPriority.NORMAL),
  startsAt: z.string().min(1, 'Data de inicio e obrigatoria'),
  endsAt: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isAllDay: z.boolean().default(false),
  location: z.string().max(255).optional(),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().url('URL invalida').optional().or(z.literal('')),
  isExternal: z.boolean().default(false),
  requiresParentalConsent: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

interface NewEventModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId: string
}

export function NewEventModal({ open, onOpenChange, schoolId }: NewEventModalProps) {
  const createEventMutation = useCreateEventMutation()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      type: EventType.ACADEMIC_EVENT,
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
      isExternal: false,
      requiresParentalConsent: false,
    },
  })

  // Auto-set isExternal when type is FIELD_TRIP
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type' && value.type === EventType.FIELD_TRIP) {
        form.setValue('isExternal', true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const onSubmit = async (values: FormValues) => {
    toast.promise(
      createEventMutation.mutateAsync({
        title: values.title,
        description: values.description,
        type: values.type as any,
        visibility: values.visibility as any,
        location: values.location,
        requiresParentalConsent: values.requiresParentalConsent,
        schoolId,
        startsAt: new Date(values.startsAt).toISOString(),
        endsAt: values.endsAt ? new Date(values.endsAt).toISOString() : undefined,
      }),
      {
        loading: 'Criando evento...',
        success: () => {
          form.reset()
          onOpenChange(false)
          return 'Evento criado com sucesso!'
        },
        error: 'Erro ao criar evento',
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Evento</DialogTitle>
          <DialogDescription>Preencha as informacoes do evento abaixo.</DialogDescription>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>

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

            <FormField
              control={form.control}
              name="isExternal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Evento Externo</FormLabel>
                    <FormDescription>Este evento acontece fora da escola</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.watch('type') === EventType.FIELD_TRIP}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('type') === EventType.FIELD_TRIP && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                Passeios escolares sempre sao eventos externos
              </div>
            )}

            {form.watch('isExternal') && (
              <FormField
                control={form.control}
                name="requiresParentalConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Autorizacao dos Pais</FormLabel>
                      <FormDescription>Requer autorizacao dos pais para menores de 18 anos</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createEventMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? 'Criando...' : 'Criar Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
