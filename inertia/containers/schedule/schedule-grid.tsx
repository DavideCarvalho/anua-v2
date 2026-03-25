'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '~/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/lib/api'
import type { ScheduleConfig } from './schedule-config-form'

interface ScheduleGridProps {
  classId: string
  academicPeriodId: string
  scheduleConfig: ScheduleConfig
  className?: string
}

interface CalendarSlot {
  id: string
  teacherHasClassId: string | null
  classWeekDay: number
  startTime: string
  endTime: string
  minutes: number
  isBreak: boolean
  teacherHasClass?: {
    id: string
    teacher: {
      id: string
      user: { name: string }
    }
    subject: {
      id: string
      name: string
    }
  } | null
}

interface TeacherHasClass {
  id: string
  subjectQuantity: number
  teacher: {
    id: string
    user: { name: string }
  }
  subject: {
    id: string
    name: string
  }
}

interface ScheduleData {
  calendar: {
    id: string
    name: string
    isActive: boolean
  } | null
  slots: CalendarSlot[]
  teacherClasses: TeacherHasClass[]
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTime(minutes: number): string {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalizedMinutes / 60)
  const remainder = normalizedMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`
}

function getConfiguredTimeSlots(config: ScheduleConfig): string[] {
  const slots: string[] = []
  let cursor = toMinutes(config.startTime)

  for (let classIndex = 1; classIndex <= config.classesPerDay; classIndex += 1) {
    const classStart = cursor
    const classEnd = classStart + config.classDuration
    slots.push(`${toTime(classStart)}-${toTime(classEnd)}`)
    cursor = classEnd

    const shouldInsertBreak =
      config.breakDuration > 0 &&
      classIndex === config.breakAfterClass &&
      classIndex < config.classesPerDay

    if (shouldInsertBreak) {
      const breakStart = cursor
      const breakEnd = breakStart + config.breakDuration
      slots.push(`${toTime(breakStart)}-${toTime(breakEnd)}`)
      cursor = breakEnd
    }
  }

  return slots
}

function formatScheduleWindowLabel(
  startTime: string,
  endTime: string,
  classesCount: number,
  hasBreak: boolean
) {
  const classesLabel = `${classesCount} aula${classesCount === 1 ? '' : 's'}`
  return `${startTime} às ${endTime} (${classesLabel}${hasBreak ? ' + intervalo' : ''})`
}

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; number: number }[] = [
  { key: 'MONDAY', label: 'Segunda', number: 1 },
  { key: 'TUESDAY', label: 'Terça', number: 2 },
  { key: 'WEDNESDAY', label: 'Quarta', number: 3 },
  { key: 'THURSDAY', label: 'Quinta', number: 4 },
  { key: 'FRIDAY', label: 'Sexta', number: 5 },
]

export function ScheduleGrid({
  classId,
  academicPeriodId,
  scheduleConfig,
  className,
}: ScheduleGridProps) {
  const [localSlots, setLocalSlots] = useState<CalendarSlot[]>([])
  const [_isDirty, setIsDirty] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const {
    data: scheduleData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['classSchedule', classId, academicPeriodId],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/schedules/class/${classId}?academicPeriodId=${academicPeriodId}`,
        {
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar grade de horários')
      }

      return (await response.json()) as ScheduleData
    },
    enabled: !!classId && !!academicPeriodId,
  }) as {
    data: ScheduleData | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }

  const saveMutation = useMutation(api.api.v1.schedules.saveClassSchedule.mutationOptions())
  const generateMutation = useMutation(api.api.v1.schedules.generateClassSchedule.mutationOptions())
  const validateConflictMutation = useMutation(
    api.api.v1.schedules.validateConflict.mutationOptions()
  )

  const handleGenerateSchedule = useCallback(async () => {
    try {
      await generateMutation.mutateAsync({
        params: { classId },
        body: {
          academicPeriodId,
          config: scheduleConfig,
        },
      } as any)

      await queryClient.invalidateQueries({
        queryKey: ['classSchedule', classId, academicPeriodId],
      })
      await refetch()
      toast.success('Grade gerada com sucesso!')
      setIsGenerateDialogOpen(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar grade'
      toast.error(errorMessage)
    } finally {
      setIsGenerateDialogOpen(false)
    }
  }, [academicPeriodId, classId, generateMutation, queryClient, refetch, scheduleConfig])

  // Initialize local slots when data changes
  useMemo(() => {
    if (scheduleData?.slots) {
      setLocalSlots(scheduleData.slots)
      setIsDirty(false)
    }
  }, [scheduleData?.slots])

  // Get unique time slots
  const timeSlots = useMemo(() => {
    if (!localSlots.length) return []
    const times = new Set<string>()
    localSlots.forEach((slot) => {
      times.add(`${slot.startTime}-${slot.endTime}`)
    })
    return Array.from(times).sort()
  }, [localSlots])

  const configuredTimeSlotSet = useMemo(
    () => new Set(getConfiguredTimeSlots(scheduleConfig)),
    [scheduleConfig]
  )
  const configuredTimeSlots = useMemo(
    () => getConfiguredTimeSlots(scheduleConfig),
    [scheduleConfig]
  )
  const hasOutOfTemplateSlots = useMemo(
    () => timeSlots.some((timeSlot) => !configuredTimeSlotSet.has(timeSlot)),
    [configuredTimeSlotSet, timeSlots]
  )
  const outOfTemplateSlots = useMemo(
    () => timeSlots.filter((timeSlot) => !configuredTimeSlotSet.has(timeSlot)),
    [configuredTimeSlotSet, timeSlots]
  )

  const currentScheduleSummary = useMemo(() => {
    if (!timeSlots.length) return null

    const sortedSlots = [...timeSlots].sort()
    const firstRange = sortedSlots[0]
    const lastRange = sortedSlots[sortedSlots.length - 1]
    const firstStart = firstRange.split('-')[0]
    const lastEnd = lastRange.split('-')[1]

    const breakSlotKeys = new Set(
      localSlots.filter((slot) => slot.isBreak).map((slot) => `${slot.startTime}-${slot.endTime}`)
    )
    const classesCount = sortedSlots.length - breakSlotKeys.size
    const hasBreak = breakSlotKeys.size > 0

    return formatScheduleWindowLabel(firstStart, lastEnd, classesCount, hasBreak)
  }, [localSlots, timeSlots])

  const configuredScheduleSummary = useMemo(() => {
    if (!configuredTimeSlots.length) return null

    const firstStart = configuredTimeSlots[0].split('-')[0]
    const lastEnd = configuredTimeSlots[configuredTimeSlots.length - 1].split('-')[1]
    const hasBreak =
      scheduleConfig.breakDuration > 0 &&
      scheduleConfig.breakAfterClass < scheduleConfig.classesPerDay

    return formatScheduleWindowLabel(firstStart, lastEnd, scheduleConfig.classesPerDay, hasBreak)
  }, [configuredTimeSlots, scheduleConfig])

  // Get pending classes (not yet scheduled enough times)
  const pendingClasses = useMemo(() => {
    if (!scheduleData?.teacherClasses) return []
    return scheduleData.teacherClasses
      .map((tc) => {
        // Contar apenas slots que não são intervalos e têm o teacherHasClassId correspondente
        const scheduledCount = localSlots.filter(
          (s) => !s.isBreak && s.teacherHasClassId === tc.id
        ).length
        const missing = tc.subjectQuantity - scheduledCount
        if (missing <= 0) return null
        return { ...tc, missing }
      })
      .filter(Boolean) as Array<TeacherHasClass & { missing: number }>
  }, [scheduleData?.teacherClasses, localSlots])

  const handleSave = useCallback(async () => {
    // Validar se há aulas pendentes
    if (pendingClasses.length > 0) {
      const totalMissing = pendingClasses.reduce((sum, pc) => sum + pc.missing, 0)
      toast.warning(
        `Existem ${totalMissing} aula(s) pendente(s) que ainda não foram atribuídas. Deseja continuar mesmo assim?`,
        {
          duration: 5000,
        }
      )
    }

    // Validar se há slots vazios (opcional - apenas aviso)
    const emptySlots = localSlots.filter((s) => !s.isBreak && !s.teacherHasClassId).length
    if (emptySlots > 0) {
      toast.info(
        `Existem ${emptySlots} horário(s) vazio(s) na grade. Você pode preenchê-los depois.`,
        {
          duration: 4000,
        }
      )
    }

    const saveInput = localSlots.map((s) => ({
      teacherHasClassId: s.teacherHasClassId,
      classWeekDay: s.classWeekDay,
      startTime: s.startTime,
      endTime: s.endTime,
    }))

    try {
      await saveMutation.mutateAsync({
        params: { classId },
        body: {
          academicPeriodId,
          slots: saveInput,
        },
      } as any)
      queryClient.invalidateQueries({ queryKey: ['classSchedule', classId, academicPeriodId] })
      toast.success('Horários salvos com sucesso!')
      setIsDirty(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar horários'
      toast.error(errorMessage)
    }
  }, [pendingClasses, localSlots, saveMutation, classId, academicPeriodId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!active || !over || active.id === over.id) return

      // Parse slot keys
      const activeId = active.id.toString()
      const overId = over.id.toString()

      // Handle pending class being dragged to a slot
      if (activeId.startsWith('pending_')) {
        const teacherHasClassId = activeId.replace('pending_', '').split('_')[0]
        const [dayStr, timeRange] = overId.split('_')
        if (!dayStr || !timeRange) return

        const [startTime, endTime] = timeRange.split('-')
        const dayNumber = parseInt(dayStr)

        // Find the target slot
        const slotIndex = localSlots.findIndex(
          (s) => s.classWeekDay === dayNumber && s.startTime === startTime && s.endTime === endTime
        )

        if (slotIndex === -1) return

        // Não permitir arrastar para slots de intervalo
        if (localSlots[slotIndex].isBreak) {
          toast.error('Não é possível adicionar aulas em horários de intervalo')
          return
        }

        // Check if slot is already occupied
        if (localSlots[slotIndex].teacherHasClassId) {
          toast.error('Este horário já está ocupado')
          return
        }

        // Validar conflito de professor
        try {
          const validation = await validateConflictMutation.mutateAsync({
            body: {
              teacherHasClassId,
              classWeekDay: dayNumber,
              startTime,
              endTime,
              academicPeriodId,
              classId,
            },
          })
          if (validation.hasConflict) {
            toast.error(validation.reason || 'Conflito de horário detectado')
            return
          }
        } catch (error) {
          toast.error('Erro ao validar disponibilidade do professor')
          return
        }

        // Update the slot
        const newSlots = [...localSlots]
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          teacherHasClassId,
          teacherHasClass:
            scheduleData?.teacherClasses.find((tc) => tc.id === teacherHasClassId) ?? null,
        }
        setLocalSlots(newSlots)
        setIsDirty(true)
        return
      }

      // Swap two slots
      const [activeDay, activeTime] = activeId.split('_')
      const [overDay, overTime] = overId.split('_')
      if (!activeDay || !activeTime || !overDay || !overTime) return

      const [activeStart, activeEnd] = activeTime.split('-')
      const [overStart, overEnd] = overTime.split('-')
      const activeDayNum = parseInt(activeDay)
      const overDayNum = parseInt(overDay)

      const activeSlotIndex = localSlots.findIndex(
        (s) =>
          s.classWeekDay === activeDayNum && s.startTime === activeStart && s.endTime === activeEnd
      )
      const overSlotIndex = localSlots.findIndex(
        (s) => s.classWeekDay === overDayNum && s.startTime === overStart && s.endTime === overEnd
      )

      if (activeSlotIndex === -1 || overSlotIndex === -1) return

      // Não permitir swap com slots de intervalo
      if (localSlots[activeSlotIndex].isBreak || localSlots[overSlotIndex].isBreak) {
        toast.error('Não é possível mover aulas para ou de um horário de intervalo')
        return
      }

      const activeSlot = localSlots[activeSlotIndex]
      const overSlot = localSlots[overSlotIndex]

      // Validar conflitos antes de fazer o swap
      // Validar se a aula do slot ativo pode ir para o slot de destino
      if (overSlot.teacherHasClassId) {
        try {
          const validation = await validateConflictMutation.mutateAsync({
            body: {
              teacherHasClassId: overSlot.teacherHasClassId,
              classWeekDay: activeDayNum,
              startTime: activeStart,
              endTime: activeEnd,
              academicPeriodId,
              classId,
            },
          })
          if (validation.hasConflict) {
            toast.error(
              `${validation.teacherName || 'Professor'}: ${validation.reason || 'Conflito de horário detectado'}`
            )
            return
          }
        } catch (error) {
          toast.error('Erro ao validar disponibilidade do professor')
          return
        }
      }

      // Validar se a aula do slot de destino pode ir para o slot ativo
      if (activeSlot.teacherHasClassId) {
        try {
          const validation = await validateConflictMutation.mutateAsync({
            body: {
              teacherHasClassId: activeSlot.teacherHasClassId,
              classWeekDay: overDayNum,
              startTime: overStart,
              endTime: overEnd,
              academicPeriodId,
              classId,
            },
          })
          if (validation.hasConflict) {
            toast.error(
              `${validation.teacherName || 'Professor'}: ${validation.reason || 'Conflito de horário detectado'}`
            )
            return
          }
        } catch (error) {
          toast.error('Erro ao validar disponibilidade do professor')
          return
        }
      }

      const newSlots = [...localSlots]
      // Salvar valores originais antes de fazer o swap
      const activeTeacherHasClassId = newSlots[activeSlotIndex].teacherHasClassId
      const activeTeacherHasClass = newSlots[activeSlotIndex].teacherHasClass
      const overTeacherHasClassId = newSlots[overSlotIndex].teacherHasClassId
      const overTeacherHasClass = newSlots[overSlotIndex].teacherHasClass

      newSlots[activeSlotIndex] = {
        ...newSlots[activeSlotIndex],
        teacherHasClassId: overTeacherHasClassId,
        teacherHasClass: overTeacherHasClass,
      }
      newSlots[overSlotIndex] = {
        ...newSlots[overSlotIndex],
        teacherHasClassId: activeTeacherHasClassId,
        teacherHasClass: activeTeacherHasClass,
      }

      setLocalSlots(newSlots)
      setIsDirty(true)
    },
    [localSlots, scheduleData?.teacherClasses, academicPeriodId, classId]
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-2 py-6 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Erro ao carregar horários. Tente novamente.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  const allSlotKeys = localSlots.map((s) => `${s.classWeekDay}_${s.startTime}-${s.endTime}`)
  const pendingKeys = pendingClasses.flatMap((pc) =>
    Array.from({ length: pc.missing }, (_, i) => `pending_${pc.id}_${i}`)
  )

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <AlertDialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={saveMutation.isPending || generateMutation.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Gerar Grade
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Gerar nova grade?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação vai substituir a grade atual e redistribuir as aulas automaticamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={generateMutation.isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGenerateSchedule}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Gerando...' : 'Gerar nova grade'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={[...allSlotKeys, ...pendingKeys]} strategy={rectSwappingStrategy}>
          {/* Pending classes */}
          {pendingClasses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Aulas Pendentes (Arraste para o calendário)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingClasses.map((pc) =>
                    Array.from({ length: pc.missing }, (_, i) => (
                      <DraggablePendingClass
                        key={`pending_${pc.id}_${i}`}
                        id={`pending_${pc.id}_${i}`}
                        teacher={pc.teacher.user.name}
                        subject={pc.subject.name}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule table */}
          <Card>
            <CardHeader>
              <CardTitle>Grade de Horários - {className}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {hasOutOfTemplateSlots && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-medium">
                    Configuração da grade não contempla todos os horários
                  </p>
                  <p className="mt-1">Grade atual: {currentScheduleSummary ?? 'não disponível'}</p>
                  <p className="mt-1">
                    Configuração atual: {configuredScheduleSummary ?? 'não disponível'}
                  </p>
                  {outOfTemplateSlots.length > 0 && (
                    <p className="mt-1">
                      Horários fora da configuração:{' '}
                      {outOfTemplateSlots.map((slot) => slot.replace('-', ' - ')).join(', ')}
                    </p>
                  )}
                  <p className="mt-1">Esses horários aparecem em cinza para revisão.</p>
                </div>
              )}
              {timeSlots.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Nenhum horário configurado para esta turma.</p>
                  <p className="mt-2 text-sm">
                    Configure os horários base primeiro para poder atribuir professores e
                    disciplinas.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Horário</TableHead>
                      {DAYS_OF_WEEK.map((day) => (
                        <TableHead key={day.key}>{day.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots.map((timeSlot) => {
                      const [startTime, endTime] = timeSlot.split('-')
                      const isOutOfTemplate = !configuredTimeSlotSet.has(timeSlot)
                      return (
                        <TableRow key={timeSlot} className={cn(isOutOfTemplate && 'bg-muted/30')}>
                          <TableCell
                            className={cn(
                              'font-medium',
                              isOutOfTemplate && 'text-muted-foreground'
                            )}
                          >
                            {startTime} - {endTime}
                          </TableCell>
                          {DAYS_OF_WEEK.map((day) => {
                            const slot = localSlots.find(
                              (s) =>
                                s.classWeekDay === day.number &&
                                s.startTime === startTime &&
                                s.endTime === endTime
                            )
                            if (!slot) {
                              return (
                                <TableCell
                                  key={day.key}
                                  className={cn(
                                    isOutOfTemplate && 'bg-muted/40 text-muted-foreground'
                                  )}
                                >
                                  -
                                </TableCell>
                              )
                            }
                            if (slot.isBreak) {
                              return (
                                <TableCell
                                  key={day.key}
                                  className={cn(
                                    'bg-muted text-center text-muted-foreground',
                                    isOutOfTemplate && 'bg-muted/60'
                                  )}
                                >
                                  INTERVALO
                                </TableCell>
                              )
                            }
                            return (
                              <ScheduleSlotCell
                                key={day.key}
                                slotId={`${day.number}_${startTime}-${endTime}`}
                                teacherHasClass={slot.teacherHasClass}
                                isOutOfTemplate={isOutOfTemplate}
                              />
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface DraggablePendingClassProps {
  id: string
  teacher: string
  subject: string
}

function DraggablePendingClass({ id, teacher, subject }: DraggablePendingClassProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move transition-shadow hover:shadow-md"
    >
      <CardContent className="p-4">
        <p className="text-sm font-medium">{subject}</p>
        <p className="text-xs text-muted-foreground">{teacher}</p>
      </CardContent>
    </Card>
  )
}

interface ScheduleSlotCellProps {
  slotId: string
  isOutOfTemplate?: boolean
  teacherHasClass?: {
    id: string
    teacher: { id: string; user: { name: string } }
    subject: { id: string; name: string }
  } | null
}

function ScheduleSlotCell({
  slotId,
  teacherHasClass,
  isOutOfTemplate = false,
}: ScheduleSlotCellProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slotId,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-move transition-colors',
        isOutOfTemplate && 'bg-muted/40',
        isDragging && 'bg-primary/10',
        !teacherHasClass && 'bg-muted/30'
      )}
    >
      {teacherHasClass ? (
        <div className="space-y-1">
          <p
            className={cn(
              'text-sm font-medium text-primary',
              isOutOfTemplate && 'text-muted-foreground'
            )}
          >
            {teacherHasClass.subject.name}
          </p>
          <p className="text-xs text-muted-foreground">{teacherHasClass.teacher.user.name}</p>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  )
}
