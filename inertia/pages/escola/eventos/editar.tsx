import { Head, Link, router } from '@inertiajs/react'
import { type KeyboardEvent, useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { EscolaLayout } from '../../../components/layouts'
import { Stepper } from '../../../components/ui/stepper'
import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { Switch } from '../../../components/ui/switch'
import { Checkbox } from '../../../components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useEventQueryOptions } from '../../../hooks/queries/use_event'
import { useUpdateEventMutation } from '../../../hooks/mutations/use_update_event'
import { useAcademicPeriodsQueryOptions } from '../../../hooks/queries/use_academic_periods'
import { useLevelsQueryOptions } from '../../../hooks/queries/use_levels'
import { useClassesQueryOptions } from '../../../hooks/queries/use_classes'
import { getEducationType, type AcademicPeriodSegment } from '../../../lib/formatters'

const EventType = {
  ACADEMIC_EVENT: 'ACADEMIC_EVENT',
  EXAM: 'EXAM',
  ASSIGNMENT: 'ASSIGNMENT',
  FIELD_TRIP: 'FIELD_TRIP',
  PARENTS_MEETING: 'PARENTS_MEETING',
  CULTURAL_EVENT: 'CULTURAL_EVENT',
  SPORTS_EVENT: 'SPORTS_EVENT',
  OTHER: 'OTHER',
} as const

const steps = [
  { title: 'Informações', description: 'Dados do evento' },
  { title: 'Público', description: 'Quem vai receber' },
  { title: 'Regras', description: 'Consentimento e custo' },
  { title: 'Revisão', description: 'Conferir e salvar' },
]

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function buildIsoDateTime(date: string, time?: string) {
  if (!time) return new Date(date).toISOString()
  return new Date(`${date}T${time}:00`).toISOString()
}

function toDateInputValue(value: unknown) {
  if (!value) return ''

  const raw = String(value)
  const dateMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) return dateMatch[1]

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTimeInputValue(value: unknown) {
  if (!value) return ''

  const raw = String(value)
  const timeMatch = raw.match(/(\d{2}:\d{2})/)
  return timeMatch ? timeMatch[1] : ''
}

const formSchema = z
  .object({
    title: z.string().min(1, 'Título é obrigatório').max(255),
    description: z.string().optional(),
    type: z.enum([
      EventType.ACADEMIC_EVENT,
      EventType.EXAM,
      EventType.ASSIGNMENT,
      EventType.FIELD_TRIP,
      EventType.PARENTS_MEETING,
      EventType.CULTURAL_EVENT,
      EventType.SPORTS_EVENT,
      EventType.OTHER,
    ]),
    startsAt: z.string().min(1, 'Data de início é obrigatória'),
    endsAt: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    isAllDay: z.boolean().default(false),
    location: z.string().max(255).optional(),
    isExternal: z.boolean().default(false),
    requiresParentalConsent: z.boolean().default(false),
    hasAdditionalCosts: z.boolean().default(false),
    additionalCostAmount: z.coerce.number().positive('Informe um valor maior que zero').optional(),
    additionalCostInstallments: z.coerce.number().min(1).max(12).default(1),
    additionalCostDescription: z.string().max(255).optional(),
    audienceWholeSchool: z.boolean().default(true),
    audienceAcademicPeriodIds: z.array(z.string()).default([]),
    audienceLevelIds: z.array(z.string()).default([]),
    audienceClassIds: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.audienceWholeSchool) return
    const hasAnyAudience =
      values.audienceAcademicPeriodIds.length > 0 ||
      values.audienceLevelIds.length > 0 ||
      values.audienceClassIds.length > 0
    if (hasAnyAudience) return
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Selecione ao menos um período letivo, ano ou turma',
      path: ['audienceAcademicPeriodIds'],
    })
  })

type FormValues = z.infer<typeof formSchema>

interface Props {
  eventId: string
}

export default function EditarEventoPage({ eventId }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const updateEventMutation = useUpdateEventMutation()
  const { data: event, isLoading: isLoadingEvent } = useQuery(useEventQueryOptions({ id: eventId }))

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      type: EventType.ACADEMIC_EVENT,
      startsAt: '',
      endsAt: '',
      startTime: '',
      endTime: '',
      isAllDay: false,
      location: '',
      isExternal: false,
      requiresParentalConsent: false,
      hasAdditionalCosts: false,
      additionalCostAmount: undefined,
      additionalCostInstallments: 1,
      additionalCostDescription: '',
      audienceWholeSchool: true,
      audienceAcademicPeriodIds: [],
      audienceLevelIds: [],
      audienceClassIds: [],
    },
  })

  useEffect(() => {
    if (!event) return

    const startTime = event.isAllDay ? '' : toTimeInputValue(event.startTime)
    const endTime = event.isAllDay ? '' : toTimeInputValue(event.endTime)

    form.reset({
      title: event.title,
      description: event.description || '',
      type: event.type as FormValues['type'],
      startsAt: toDateInputValue(event.startDate),
      endsAt: toDateInputValue(event.endDate),
      startTime,
      endTime,
      isAllDay: event.isAllDay,
      location: event.location || '',
      isExternal: event.isExternal,
      requiresParentalConsent: event.requiresParentalConsent,
      hasAdditionalCosts: Boolean((event as any).hasAdditionalCosts),
      additionalCostAmount: (event as any).additionalCostAmount ?? undefined,
      additionalCostInstallments: (event as any).additionalCostInstallments ?? 1,
      additionalCostDescription: (event as any).additionalCostDescription || '',
      audienceWholeSchool: Boolean((event as any).audienceWholeSchool ?? true),
      audienceAcademicPeriodIds: (event as any).audienceAcademicPeriodIds ?? [],
      audienceLevelIds: (event as any).audienceLevelIds ?? [],
      audienceClassIds: (event as any).audienceClassIds ?? [],
    })
  }, [event, form])

  const values = form.watch()
  const periodIds = form.watch('audienceAcademicPeriodIds')
  const levelIds = form.watch('audienceLevelIds')
  const singleAcademicPeriodId = periodIds.length === 1 ? periodIds[0] : undefined

  const { data: periodsData } = useQuery(useAcademicPeriodsQueryOptions({ limit: 100 }))
  const { data: levelsData, isFetched: hasFetchedLevels } = useQuery({
    ...useLevelsQueryOptions({
      schoolId: event?.schoolId ?? '',
      limit: 300,
      academicPeriodId: singleAcademicPeriodId,
    }),
    enabled: Boolean(event?.schoolId) && !values.audienceWholeSchool && periodIds.length > 0,
  })
  const { data: classesData, isFetched: hasFetchedClasses } = useQuery({
    ...useClassesQueryOptions({
      schoolId: event?.schoolId ?? '',
      limit: 300,
      academicPeriodId: singleAcademicPeriodId,
    }),
    enabled:
      Boolean(event?.schoolId) &&
      !values.audienceWholeSchool &&
      periodIds.length > 0 &&
      levelIds.length > 0,
  })

  const academicPeriods = periodsData?.data ?? []
  const selectedPeriods = academicPeriods.filter((period) => periodIds.includes(period.id))
  const isFormalAudience =
    selectedPeriods.length > 0 &&
    selectedPeriods.every(
      (period) => getEducationType(period.segment as AcademicPeriodSegment) === 'formal'
    )

  const levels = useMemo(() => {
    const rawLevels = levelsData?.data ?? []
    if (!isFormalAudience) return rawLevels

    const uniqueByName = new Map<string, (typeof rawLevels)[number]>()
    for (const level of rawLevels) {
      const key = level.name.trim().toLowerCase()
      if (!uniqueByName.has(key)) uniqueByName.set(key, level)
    }
    return Array.from(uniqueByName.values())
  }, [levelsData?.data, isFormalAudience])

  const classes = useMemo(() => {
    const rawClasses = classesData?.data ?? []
    const filtered = rawClasses.filter(
      (classItem) => classItem.levelId && levelIds.includes(classItem.levelId)
    )
    const uniqueById = new Map(filtered.map((classItem) => [classItem.id, classItem]))
    return Array.from(uniqueById.values())
  }, [classesData?.data, levelIds])

  useEffect(() => {
    if (values.audienceWholeSchool) {
      const currentPeriodIds = form.getValues('audienceAcademicPeriodIds')
      const currentLevelIds = form.getValues('audienceLevelIds')
      const currentClassIds = form.getValues('audienceClassIds')
      if (currentPeriodIds.length > 0) form.setValue('audienceAcademicPeriodIds', [])
      if (currentLevelIds.length > 0) form.setValue('audienceLevelIds', [])
      if (currentClassIds.length > 0) form.setValue('audienceClassIds', [])
      return
    }

    if (periodIds.length > 0 && !hasFetchedLevels) return
    if (levelIds.length > 0 && !hasFetchedClasses) return

    const validLevelIds = new Set(levels.map((level) => level.id))
    const validClassIds = new Set(classes.map((classItem) => classItem.id))
    const currentLevelIds = form.getValues('audienceLevelIds')
    const currentClassIds = form.getValues('audienceClassIds')
    const nextLevelIds = currentLevelIds.filter((id) => validLevelIds.has(id))
    const nextClassIds = currentClassIds.filter((id) => validClassIds.has(id))
    if (!areStringArraysEqual(currentLevelIds, nextLevelIds)) {
      form.setValue('audienceLevelIds', nextLevelIds)
    }
    if (!areStringArraysEqual(currentClassIds, nextClassIds)) {
      form.setValue('audienceClassIds', nextClassIds)
    }
  }, [
    values.audienceWholeSchool,
    periodIds.length,
    levelIds.length,
    hasFetchedLevels,
    hasFetchedClasses,
    levels,
    classes,
    form,
  ])

  const audienceSummary = useMemo(() => {
    if (values.audienceWholeSchool) return 'Escola inteira'
    return `${values.audienceAcademicPeriodIds.length} períodos, ${values.audienceLevelIds.length} anos, ${values.audienceClassIds.length} turmas`
  }, [values])

  const isLastStep = currentStep === steps.length - 1

  const validateStep = async (stepIndex: number) => {
    if (stepIndex === 0) return form.trigger(['title', 'type', 'startsAt', 'endsAt'])
    if (stepIndex === 1) {
      return form.trigger([
        'audienceWholeSchool',
        'audienceAcademicPeriodIds',
        'audienceLevelIds',
        'audienceClassIds',
      ])
    }
    if (stepIndex === 2) {
      return form.trigger(['requiresParentalConsent', 'hasAdditionalCosts', 'additionalCostAmount'])
    }
    return true
  }

  const handleNext = async () => {
    const valid = await validateStep(currentStep)
    if (!valid) return
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleFormKeyDown = async (eventKey: KeyboardEvent<HTMLFormElement>) => {
    const isEnter = eventKey.key === 'Enter'
    const isTextarea = eventKey.target instanceof HTMLTextAreaElement
    if (!isEnter || isTextarea || isLastStep) return
    eventKey.preventDefault()
    await handleNext()
  }

  const onSubmit = async (formValues: FormValues) => {
    const startsAtIso = buildIsoDateTime(
      formValues.startsAt,
      formValues.isAllDay ? undefined : formValues.startTime
    )

    const endsAtBaseDate = formValues.endsAt || formValues.startsAt
    const endsAtIso = formValues.endsAt
      ? buildIsoDateTime(endsAtBaseDate, formValues.isAllDay ? undefined : formValues.endTime)
      : undefined

    toast.promise(
      updateEventMutation.mutateAsync({
        id: eventId,
        title: formValues.title,
        description: formValues.description,
        type: formValues.type,
        location: formValues.location,
        isAllDay: formValues.isAllDay,
        startTime: formValues.isAllDay ? null : formValues.startTime || null,
        endTime: formValues.isAllDay ? null : formValues.endTime || null,
        isExternal: formValues.isExternal,
        requiresParentalConsent: formValues.requiresParentalConsent,
        hasAdditionalCosts: formValues.hasAdditionalCosts,
        additionalCostAmount: formValues.hasAdditionalCosts
          ? formValues.additionalCostAmount
          : undefined,
        additionalCostInstallments: formValues.hasAdditionalCosts
          ? formValues.additionalCostInstallments
          : undefined,
        additionalCostDescription: formValues.hasAdditionalCosts
          ? formValues.additionalCostDescription
          : undefined,
        audienceWholeSchool: formValues.audienceWholeSchool,
        audienceAcademicPeriodIds: formValues.audienceWholeSchool
          ? []
          : formValues.audienceAcademicPeriodIds,
        audienceLevelIds: formValues.audienceWholeSchool ? [] : formValues.audienceLevelIds,
        audienceClassIds: formValues.audienceWholeSchool ? [] : formValues.audienceClassIds,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
      }),
      {
        loading: 'Salvando evento...',
        success: () => {
          router.visit('/escola/eventos')
          return 'Evento atualizado com sucesso!'
        },
        error: 'Erro ao atualizar evento',
      }
    )
  }

  return (
    <EscolaLayout>
      <Head title="Editar Evento" />

      {isLoadingEvent && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Carregando evento...
        </div>
      )}

      {!isLoadingEvent && !event && (
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          Não foi possível carregar o evento.
        </div>
      )}

      {!isLoadingEvent && event && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Editar Evento</h1>
              <p className="text-sm text-muted-foreground">Atualize o evento por etapas</p>
            </div>
            <Button type="button" variant="outline" asChild>
              <Link href="/escola/eventos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para eventos
              </Link>
            </Button>
          </div>

          <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              onKeyDown={handleFormKeyDown}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea rows={3} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={EventType.ACADEMIC_EVENT}>
                                  Evento Acadêmico
                                </SelectItem>
                                <SelectItem value={EventType.EXAM}>Prova</SelectItem>
                                <SelectItem value={EventType.ASSIGNMENT}>Trabalho</SelectItem>
                                <SelectItem value={EventType.FIELD_TRIP}>Passeio</SelectItem>
                                <SelectItem value={EventType.PARENTS_MEETING}>
                                  Reunião de pais
                                </SelectItem>
                                <SelectItem value={EventType.CULTURAL_EVENT}>
                                  Evento cultural
                                </SelectItem>
                                <SelectItem value={EventType.SPORTS_EVENT}>
                                  Evento esportivo
                                </SelectItem>
                                <SelectItem value={EventType.OTHER}>Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="startsAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de início *</FormLabel>
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
                            <FormLabel>Data de término</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
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
                            <FormLabel>Dia inteiro</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {!values.isAllDay && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de início</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora de término</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Público do evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="audienceWholeSchool"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Escola inteira</FormLabel>
                            <FormDescription>Enviar para todos os alunos da escola</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {!values.audienceWholeSchool && (
                      <div className="space-y-4 rounded-lg border p-4">
                        <FormField
                          control={form.control}
                          name="audienceAcademicPeriodIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Períodos letivos</FormLabel>
                              <div className="max-h-28 space-y-2 overflow-y-auto rounded-md border p-3">
                                {academicPeriods.map((period) => (
                                  <label
                                    key={period.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Checkbox
                                      checked={field.value.includes(period.id)}
                                      onCheckedChange={(checked) =>
                                        field.onChange(
                                          checked
                                            ? [...field.value, period.id]
                                            : field.value.filter((id) => id !== period.id)
                                        )
                                      }
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
                              <FormLabel>{isFormalAudience ? 'Anos' : 'Níveis'}</FormLabel>
                              <div className="max-h-28 space-y-2 overflow-y-auto rounded-md border p-3">
                                {levels.map((level) => (
                                  <label key={level.id} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                      checked={field.value.includes(level.id)}
                                      onCheckedChange={(checked) =>
                                        field.onChange(
                                          checked
                                            ? [...field.value, level.id]
                                            : field.value.filter((id) => id !== level.id)
                                        )
                                      }
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
                                  <label
                                    key={classItem.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Checkbox
                                      checked={field.value.includes(classItem.id)}
                                      onCheckedChange={(checked) =>
                                        field.onChange(
                                          checked
                                            ? [...field.value, classItem.id]
                                            : field.value.filter((id) => id !== classItem.id)
                                        )
                                      }
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
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Regras e financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isExternal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Evento externo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {values.isExternal && (
                      <FormField
                        control={form.control}
                        name="requiresParentalConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Requer autorização</FormLabel>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
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
                            <FormLabel>Evento pago</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (!checked) {
                                  form.setValue('additionalCostAmount', undefined)
                                  form.setValue('additionalCostInstallments', 1)
                                  form.setValue('additionalCostDescription', '')
                                }
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {values.hasAdditionalCosts && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="additionalCostAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor adicional (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="additionalCostInstallments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parcelas</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  max="12"
                                  step="1"
                                  value={field.value ?? 1}
                                  onChange={(e) => field.onChange(e.target.value)}
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
                              <FormLabel>Descrição do custo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Revisão do evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>Título:</strong> {values.title || '-'}
                    </p>
                    <p>
                      <strong>Início:</strong> {values.startsAt || '-'}
                    </p>
                    <p>
                      <strong>Término:</strong> {values.endsAt || '-'}
                    </p>
                    <p>
                      <strong>Horário:</strong>{' '}
                      {values.isAllDay
                        ? 'Dia inteiro'
                        : values.startTime || values.endTime
                          ? `${values.startTime || '--:--'} até ${values.endTime || '--:--'}`
                          : 'Não informado'}
                    </p>
                    <p>
                      <strong>Público:</strong> {audienceSummary}
                    </p>
                    <p>
                      <strong>Autorização:</strong> {values.requiresParentalConsent ? 'Sim' : 'Não'}
                    </p>
                    <p>
                      <strong>Evento pago:</strong>{' '}
                      {values.hasAdditionalCosts
                        ? `Sim (R$ ${values.additionalCostAmount ?? '-'} em até ${values.additionalCostInstallments || 1}x)`
                        : 'Não'}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentStep === 0 || updateEventMutation.isPending}
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                >
                  Voltar
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={updateEventMutation.isPending}
                    asChild
                  >
                    <Link href="/escola/eventos">Cancelar</Link>
                  </Button>
                  {!isLastStep ? (
                    <Button type="button" onClick={handleNext}>
                      Continuar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      disabled={updateEventMutation.isPending}
                    >
                      {updateEventMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}
    </EscolaLayout>
  )
}
