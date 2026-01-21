'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
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

interface ScheduleGridProps {
  classId: string
  academicPeriodId: string
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

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY'

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; number: number }[] = [
  { key: 'MONDAY', label: 'Segunda', number: 1 },
  { key: 'TUESDAY', label: 'Terça', number: 2 },
  { key: 'WEDNESDAY', label: 'Quarta', number: 3 },
  { key: 'THURSDAY', label: 'Quinta', number: 4 },
  { key: 'FRIDAY', label: 'Sexta', number: 5 },
]

async function fetchSchedule(classId: string, academicPeriodId: string): Promise<ScheduleData> {
  const response = await fetch(
    `/api/v1/schedules/class/${classId}?academicPeriodId=${academicPeriodId}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch schedule')
  }
  return response.json()
}

async function saveSchedule(
  classId: string,
  academicPeriodId: string,
  slots: Array<{
    teacherHasClassId: string | null
    classWeekDay: number
    startTime: string
    endTime: string
  }>
): Promise<void> {
  const response = await fetch(`/api/v1/schedules/class/${classId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ academicPeriodId, slots }),
  })
  if (!response.ok) {
    throw new Error('Failed to save schedule')
  }
}

export function ScheduleGrid({ classId, academicPeriodId, className }: ScheduleGridProps) {
  const queryClient = useQueryClient()
  const [localSlots, setLocalSlots] = useState<CalendarSlot[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const {
    data: scheduleData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schedule', classId, academicPeriodId],
    queryFn: () => fetchSchedule(classId, academicPeriodId),
    enabled: !!classId && !!academicPeriodId,
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      saveSchedule(
        classId,
        academicPeriodId,
        localSlots.map((s) => ({
          teacherHasClassId: s.teacherHasClassId,
          classWeekDay: s.classWeekDay,
          startTime: s.startTime,
          endTime: s.endTime,
        }))
      ),
    onSuccess: () => {
      toast.success('Horários salvos com sucesso!')
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['schedule', classId, academicPeriodId] })
    },
    onError: () => {
      toast.error('Erro ao salvar horários')
    },
  })

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

  // Get pending classes (not yet scheduled enough times)
  const pendingClasses = useMemo(() => {
    if (!scheduleData?.teacherClasses) return []
    return scheduleData.teacherClasses
      .map((tc) => {
        const scheduledCount = localSlots.filter(
          (s) => s.teacherHasClassId === tc.id
        ).length
        const missing = tc.subjectQuantity - scheduledCount
        if (missing <= 0) return null
        return { ...tc, missing }
      })
      .filter(Boolean) as Array<TeacherHasClass & { missing: number }>
  }, [scheduleData?.teacherClasses, localSlots])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
          (s) =>
            s.classWeekDay === dayNumber &&
            s.startTime === startTime &&
            s.endTime === endTime
        )

        if (slotIndex === -1) return

        // Check if slot is already occupied
        if (localSlots[slotIndex].teacherHasClassId) {
          toast.error('Este horário já está ocupado')
          return
        }

        // Update the slot
        const newSlots = [...localSlots]
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          teacherHasClassId,
          teacherHasClass: scheduleData?.teacherClasses.find((tc) => tc.id === teacherHasClassId),
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
          s.classWeekDay === activeDayNum &&
          s.startTime === activeStart &&
          s.endTime === activeEnd
      )
      const overSlotIndex = localSlots.findIndex(
        (s) =>
          s.classWeekDay === overDayNum &&
          s.startTime === overStart &&
          s.endTime === overEnd
      )

      if (activeSlotIndex === -1 || overSlotIndex === -1) return

      const newSlots = [...localSlots]
      const activeTeacherHasClass = newSlots[activeSlotIndex].teacherHasClass
      const overTeacherHasClass = newSlots[overSlotIndex].teacherHasClass

      newSlots[activeSlotIndex] = {
        ...newSlots[activeSlotIndex],
        teacherHasClassId: newSlots[overSlotIndex].teacherHasClassId,
        teacherHasClass: overTeacherHasClass,
      }
      newSlots[overSlotIndex] = {
        ...newSlots[overSlotIndex],
        teacherHasClassId: newSlots[activeSlotIndex].teacherHasClassId,
        teacherHasClass: activeTeacherHasClass,
      }

      setLocalSlots(newSlots)
      setIsDirty(true)
    },
    [localSlots, scheduleData?.teacherClasses]
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

  const allSlotKeys = localSlots.map(
    (s) => `${s.classWeekDay}_${s.startTime}-${s.endTime}`
  )
  const pendingKeys = pendingClasses.flatMap((pc) =>
    Array.from({ length: pc.missing }, (_, i) => `pending_${pc.id}_${i}`)
  )

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => refetch()} disabled={saveMutation.isPending}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Recarregar
        </Button>
        <Button onClick={() => saveMutation.mutate()} disabled={!isDirty || saveMutation.isPending}>
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
                  {pendingClasses.map((pc, index) =>
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
              {timeSlots.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Nenhum horário configurado para esta turma.</p>
                  <p className="mt-2 text-sm">
                    Configure os horários base primeiro para poder atribuir professores e disciplinas.
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
                      return (
                        <TableRow key={timeSlot}>
                          <TableCell className="font-medium">
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
                              return <TableCell key={day.key}>-</TableCell>
                            }
                            if (slot.isBreak) {
                              return (
                                <TableCell
                                  key={day.key}
                                  className="bg-muted text-center text-muted-foreground"
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
  teacherHasClass?: {
    id: string
    teacher: { id: string; user: { name: string } }
    subject: { id: string; name: string }
  } | null
}

function ScheduleSlotCell({ slotId, teacherHasClass }: ScheduleSlotCellProps) {
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
        isDragging && 'bg-primary/10',
        !teacherHasClass && 'bg-muted/30'
      )}
    >
      {teacherHasClass ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary">{teacherHasClass.subject.name}</p>
          <p className="text-xs text-muted-foreground">{teacherHasClass.teacher.user.name}</p>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </TableCell>
  )
}
