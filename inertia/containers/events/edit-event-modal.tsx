import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
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
import { Checkbox } from '../../components/ui/checkbox'

import { useEventQueryOptions } from '../../hooks/queries/use_event'
import { useUpdateEventMutation } from '../../hooks/mutations/use_update_event'
import { useAcademicPeriodsQueryOptions } from '../../hooks/queries/use_academic_periods'
import { useLevelsQueryOptions } from '../../hooks/queries/use_levels'
import { useClassesQueryOptions } from '../../hooks/queries/use_classes'

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

const formSchema = z
  .object({
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
    hasAdditionalCosts: z.boolean(),
    additionalCostAmount: z.coerce.number().positive('Informe um valor maior que zero').optional(),
    additionalCostDescription: z.string().max(255).optional(),
    audienceWholeSchool: z.boolean().default(true),
    audienceAcademicPeriodIds: z.array(z.string()).default([]),
    audienceLevelIds: z.array(z.string()).default([]),
    audienceClassIds: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.audienceWholeSchool) {
      return
    }

    const hasAnyAudience =
      values.audienceAcademicPeriodIds.length > 0 ||
      values.audienceLevelIds.length > 0 ||
      values.audienceClassIds.length > 0

    if (hasAnyAudience) {
      return
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione ao menos um período letivo, ano ou turma',
      path: ['audienceAcademicPeriodIds'],
    })
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
  const { data: periodsData } = useQuery(useAcademicPeriodsQueryOptions({ limit: 100 }))
  const { data: levelsData } = useQuery(
    useLevelsQueryOptions({ schoolId: event.schoolId, limit: 100 })
  )
  const { data: classesData } = useQuery(
    useClassesQueryOptions({ schoolId: event.schoolId, limit: 200 })
  )

  const academicPeriods = periodsData?.data ?? []
  const levels = levelsData?.data ?? []
  const classes = classesData?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
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
      hasAdditionalCosts: false,
      additionalCostAmount: undefined,
      additionalCostDescription: '',
      audienceWholeSchool: true,
      audienceAcademicPeriodIds: [],
      audienceLevelIds: [],
      audienceClassIds: [],
    },
  })

  useEffect(() => {
    if (event) {
      const startsAt = new Date(String(event.startDate))
      const endsAt = event.endDate ? new Date(String(event.endDate)) : null

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
        hasAdditionalCosts: Boolean((event as any).hasAdditionalCosts),
        additionalCostAmount: (event as any).additionalCostAmount ?? undefined,
        additionalCostDescription: (event as any).additionalCostDescription || '',
        audienceWholeSchool: Boolean((event as any).audienceWholeSchool ?? true),
        audienceAcademicPeriodIds: (event as any).audienceAcademicPeriodIds ?? [],
        audienceLevelIds: (event as any).audienceLevelIds ?? [],
        audienceClassIds: (event as any).audienceClassIds ?? [],
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
        hasAdditionalCosts: values.hasAdditionalCosts,
        additionalCostAmount: values.hasAdditionalCosts ? values.additionalCostAmount : null,
        additionalCostDescription: values.hasAdditionalCosts
          ? values.additionalCostDescription
          : null,
        audienceWholeSchool: values.audienceWholeSchool,
        audienceAcademicPeriodIds: values.audienceWholeSchool
          ? []
          : values.audienceAcademicPeriodIds,
        audienceLevelIds: values.audienceWholeSchool ? [] : values.audienceLevelIds,
        audienceClassIds: values.audienceWholeSchool ? [] : values.audienceClassIds,
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
          <DialogDescription>Atualize as informações do evento abaixo.</DialogDescription>
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
                      <SelectItem value={EventVisibility.PARENTS_ONLY}>
                        Apenas Responsaveis
                      </SelectItem>
                      <SelectItem value={EventVisibility.STUDENTS_ONLY}>Apenas Alunos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="audienceWholeSchool"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Publico: escola inteira</FormLabel>
                    <FormDescription>
                      Marque para enviar para todos os alunos da escola
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch('audienceWholeSchool') && (
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <h3 className="text-sm font-medium">Publico segmentado</h3>
                  <p className="text-xs text-muted-foreground">
                    Voce pode combinar periodos letivos, anos e turmas
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="audienceAcademicPeriodIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Períodos letivos</FormLabel>
                      <div className="max-h-28 space-y-2 overflow-y-auto rounded-md border p-3">
                        {academicPeriods.map((period) => (
                          <label key={period.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value.includes(period.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, period.id]
                                    : field.value.filter((id) => id !== period.id)
                                )
                              }}
                            />
                            <span>{period.name}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceLevelIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anos</FormLabel>
                      <div className="max-h-28 space-y-2 overflow-y-auto rounded-md border p-3">
                        {levels.map((level) => (
                          <label key={level.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value.includes(level.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, level.id]
                                    : field.value.filter((id) => id !== level.id)
                                )
                              }}
                            />
                            <span>{level.name}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceClassIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turmas</FormLabel>
                      <div className="max-h-36 space-y-2 overflow-y-auto rounded-md border p-3">
                        {classes.map((classItem) => (
                          <label key={classItem.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={field.value.includes(classItem.id)}
                              onCheckedChange={(checked) => {
                                field.onChange(
                                  checked
                                    ? [...field.value, classItem.id]
                                    : field.value.filter((id) => id !== classItem.id)
                                )
                              }}
                            />
                            <span>{classItem.name}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

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
              name="hasAdditionalCosts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Evento Pago</FormLabel>
                    <FormDescription>
                      Habilite para registrar custo adicional no evento
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)

                        if (!checked) {
                          form.setValue('additionalCostAmount', undefined)
                          form.setValue('additionalCostDescription', '')
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('hasAdditionalCosts') && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="additionalCostAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor adicional (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Ex: 50"
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalCostDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao do custo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Transporte e ingresso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
