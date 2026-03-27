'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
  reorganizeTrigger?: number
  onDirtyChange?: (isDirty: boolean) => void
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

function normalizeTime(time: string): string {
  // Remove seconds from time string (e.g., '09:10:00' -> '09:10')
  return time.split(':').slice(0, 2).join(':')
}

function inferConfigFromSlots(slots: CalendarSlot[]): ScheduleConfig | null {
  if (!slots.length) return null

  const byDay = new Map<number, CalendarSlot[]>()
  for (const slot of slots) {
    const current = byDay.get(slot.classWeekDay) ?? []
    current.push(slot)
    byDay.set(slot.classWeekDay, current)
  }

  const dayWithMostSlots = Array.from(byDay.values())
    .sort((a, b) => b.length - a.length)
    .at(0)

  if (!dayWithMostSlots?.length) return null

  const orderedSlots = [...dayWithMostSlots].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  )

  const slotDurations = orderedSlots.map(
    (slot) => toMinutes(slot.endTime) - toMinutes(slot.startTime)
  )
  const maxDuration = Math.max(...slotDurations)
  const minDuration = Math.min(...slotDurations)

  const isBreakByDuration = orderedSlots.map((slot) => {
    const duration = toMinutes(slot.endTime) - toMinutes(slot.startTime)
    if (maxDuration - minDuration > 15) {
      return duration < maxDuration * 0.6
    }
    return slot.isBreak
  })

  const firstClass = orderedSlots.find((_slot, i) => !isBreakByDuration[i])
  const firstBreakIndex = orderedSlots.findIndex((_slot, i) => isBreakByDuration[i])
  const firstBreak = firstBreakIndex >= 0 ? orderedSlots[firstBreakIndex] : null

  const classesPerDay = orderedSlots.filter((_, i) => !isBreakByDuration[i]).length
  const classDuration = firstClass
    ? toMinutes(firstClass.endTime) - toMinutes(firstClass.startTime)
    : 50
  const breakAfterClass =
    firstBreakIndex >= 0
      ? orderedSlots.slice(0, firstBreakIndex).filter((_, i) => !isBreakByDuration[i]).length
      : 3
  const breakDuration = firstBreak
    ? toMinutes(firstBreak.endTime) - toMinutes(firstBreak.startTime)
    : 20

  return {
    startTime: firstClass?.startTime.split(':').slice(0, 2).join(':') ?? '07:30',
    classesPerDay: classesPerDay || 6,
    classDuration: classDuration || 50,
    breakAfterClass: breakAfterClass || 3,
    breakDuration: breakDuration || 20,
  }
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
      config.breakAfterClass === classIndex &&
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

function getConfiguredBreakSlots(config: ScheduleConfig): Set<string> {
  const breakSlots = new Set<string>()
  let cursor = toMinutes(config.startTime)

  for (let classIndex = 1; classIndex <= config.classesPerDay; classIndex += 1) {
    const classStart = cursor
    const classEnd = classStart + config.classDuration
    cursor = classEnd

    const shouldInsertBreak =
      config.breakDuration > 0 &&
      config.breakAfterClass === classIndex &&
      classIndex < config.classesPerDay

    if (shouldInsertBreak) {
      const breakStart = cursor
      const breakEnd = breakStart + config.breakDuration
      breakSlots.add(`${toTime(breakStart)}-${toTime(breakEnd)}`)
      cursor = breakEnd
    }
  }

  return breakSlots
}

function reorganizeSlotsLocally(
  currentSlots: CalendarSlot[],
  config: ScheduleConfig,
  daysOfWeek: number[]
): {
  slots: CalendarSlot[]
  removedClasses: Array<{ teacherHasClass: CalendarSlot['teacherHasClass']; day: number }>
} {
  const newSlots: CalendarSlot[] = []
  const removedClasses: Array<{ teacherHasClass: CalendarSlot['teacherHasClass']; day: number }> =
    []

  console.log('[DEBUG reorganizeSlotsLocally] Input:', {
    currentSlotsCount: currentSlots.length,
    configClassesPerDay: config.classesPerDay,
    daysOfWeek,
  })

  for (const dayNumber of daysOfWeek) {
    // Get slots for this day, sorted by start time, excluding breaks
    const daySlots = currentSlots
      .filter((s) => s.classWeekDay === dayNumber && !s.isBreak)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))

    console.log(`[DEBUG reorganizeSlotsLocally] Day ${dayNumber}:`, {
      daySlotsCount: daySlots.length,
      configClassesPerDay: config.classesPerDay,
      willRemove:
        daySlots.length > config.classesPerDay ? daySlots.length - config.classesPerDay : 0,
    })

    // Generate new slots for this day
    let cursor = toMinutes(config.startTime)
    const dayNewSlots: CalendarSlot[] = []

    for (let classIndex = 1; classIndex <= config.classesPerDay; classIndex += 1) {
      const classStart = cursor
      const classEnd = classStart + config.classDuration

      const existingClass = daySlots[classIndex - 1]

      dayNewSlots.push({
        id: `new-${dayNumber}-${classIndex}`,
        teacherHasClassId: existingClass?.teacherHasClassId ?? null,
        classWeekDay: dayNumber,
        startTime: toTime(classStart),
        endTime: toTime(classEnd),
        minutes: config.classDuration,
        isBreak: false,
        teacherHasClass: existingClass?.teacherHasClass ?? null,
      })

      cursor = classEnd

      // Insert break if configured
      if (
        config.breakDuration > 0 &&
        config.breakAfterClass === classIndex &&
        classIndex < config.classesPerDay
      ) {
        const breakStart = cursor
        const breakEnd = breakStart + config.breakDuration
        dayNewSlots.push({
          id: `break-${dayNumber}-${classIndex}`,
          teacherHasClassId: null,
          classWeekDay: dayNumber,
          startTime: toTime(breakStart),
          endTime: toTime(breakEnd),
          minutes: config.breakDuration,
          isBreak: true,
          teacherHasClass: null,
        })
        cursor = breakEnd
      }
    }

    // Track removed classes (if new config has fewer slots)
    console.log(`[DEBUG reorganizeSlotsLocally] Checking removed for day ${dayNumber}:`, {
      daySlotsLength: daySlots.length,
      configClassesPerDay: config.classesPerDay,
      removedRange: { start: config.classesPerDay, end: daySlots.length },
    })
    for (let i = config.classesPerDay; i < daySlots.length; i += 1) {
      const removedSlot = daySlots[i]
      console.log(`[DEBUG reorganizeSlotsLocally] Removed slot ${i}:`, {
        hasTeacherHasClass: !!removedSlot.teacherHasClass,
        subject: removedSlot.teacherHasClass?.subject?.name,
      })
      if (removedSlot.teacherHasClass) {
        removedClasses.push({
          teacherHasClass: removedSlot.teacherHasClass,
          day: dayNumber,
        })
      }
    }

    newSlots.push(...dayNewSlots)
  }

  console.log('[DEBUG reorganizeSlotsLocally] Result:', {
    newSlotsCount: newSlots.length,
    removedClassesCount: removedClasses.length,
  })

  return { slots: newSlots, removedClasses }
}

function ensureConfiguredSlots(
  existingSlots: CalendarSlot[],
  config: ScheduleConfig
): CalendarSlot[] {
  const slots: CalendarSlot[] = []
  const dayNumbers = [1, 2, 3, 4, 5] // Monday to Friday

  for (const dayNumber of dayNumbers) {
    let cursor = toMinutes(config.startTime)

    for (let classIndex = 1; classIndex <= config.classesPerDay; classIndex += 1) {
      const classStart = cursor
      const classEnd = classStart + config.classDuration
      const startTime = toTime(classStart)
      const endTime = toTime(classEnd)

      // Check if there's an existing slot for this time
      const existingSlot = existingSlots.find(
        (s) =>
          s.classWeekDay === dayNumber &&
          normalizeTime(s.startTime) === startTime &&
          normalizeTime(s.endTime) === endTime
      )

      if (existingSlot) {
        slots.push(existingSlot)
      } else {
        // Create empty slot
        slots.push({
          id: `empty-${dayNumber}-${classIndex}`,
          teacherHasClassId: null,
          classWeekDay: dayNumber,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          minutes: config.classDuration,
          isBreak: false,
          teacherHasClass: null,
        })
      }

      cursor = classEnd

      // Insert break if configured
      if (
        config.breakDuration > 0 &&
        config.breakAfterClass === classIndex &&
        classIndex < config.classesPerDay
      ) {
        const breakStart = cursor
        const breakEnd = breakStart + config.breakDuration
        const breakStartTime = toTime(breakStart)
        const breakEndTime = toTime(breakEnd)

        // Check if break slot exists
        const existingBreakSlot = existingSlots.find(
          (s) =>
            s.classWeekDay === dayNumber &&
            normalizeTime(s.startTime) === breakStartTime &&
            normalizeTime(s.endTime) === breakEndTime &&
            s.isBreak
        )

        if (existingBreakSlot) {
          slots.push(existingBreakSlot)
        } else {
          slots.push({
            id: `break-${dayNumber}-${classIndex}`,
            teacherHasClassId: null,
            classWeekDay: dayNumber,
            startTime: `${breakStartTime}:00`,
            endTime: `${breakEndTime}:00`,
            minutes: config.breakDuration,
            isBreak: true,
            teacherHasClass: null,
          })
        }

        cursor = breakEnd
      }
    }
  }

  return slots
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
  reorganizeTrigger,
  onDirtyChange,
}: ScheduleGridProps) {
  const [localSlots, setLocalSlots] = useState<CalendarSlot[]>([])
  const [originalSlots, setOriginalSlots] = useState<CalendarSlot[]>([])
  const localSlotsRef = useRef<CalendarSlot[]>([])
  const [removedClasses, setRemovedClasses] = useState<
    Array<{ teacherHasClassId: string; day: number }>
  >([])
  const [isDirty, setIsDirty] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [activeDragItem, setActiveDragItem] = useState<string | null>(null)
  const prevReorganizeTrigger = useRef(reorganizeTrigger)
  const [originalConfig, setOriginalConfig] = useState<ScheduleConfig | null>(null)

  // Function to compare if slots are different
  const areSlotsDifferent = useCallback((slotsA: CalendarSlot[], slotsB: CalendarSlot[]) => {
    if (slotsA.length !== slotsB.length) return true

    // Sort both arrays by composite key (day + startTime) instead of id
    const getSlotKey = (slot: CalendarSlot) => `${slot.classWeekDay}-${slot.startTime}`
    const sortedA = [...slotsA].sort((a, b) => getSlotKey(a).localeCompare(getSlotKey(b)))
    const sortedB = [...slotsB].sort((a, b) => getSlotKey(a).localeCompare(getSlotKey(b)))

    return sortedA.some((slotA, index) => {
      const slotB = sortedB[index]
      if (!slotB) return true
      return (
        slotA.teacherHasClassId !== slotB.teacherHasClassId ||
        slotA.classWeekDay !== slotB.classWeekDay ||
        normalizeTime(slotA.startTime) !== normalizeTime(slotB.startTime) ||
        normalizeTime(slotA.endTime) !== normalizeTime(slotB.endTime) ||
        slotA.isBreak !== slotB.isBreak
      )
    })
  }, [])

  // Check if slots or config are dirty by comparing with original
  useEffect(() => {
    const slotsChanged = areSlotsDifferent(localSlots, originalSlots)
    const configChanged =
      originalConfig && scheduleConfig
        ? normalizeTime(originalConfig.startTime) !== normalizeTime(scheduleConfig.startTime) ||
          originalConfig.classesPerDay !== scheduleConfig.classesPerDay ||
          originalConfig.classDuration !== scheduleConfig.classDuration ||
          originalConfig.breakAfterClass !== scheduleConfig.breakAfterClass ||
          originalConfig.breakDuration !== scheduleConfig.breakDuration
        : false
    setIsDirty(slotsChanged || configChanged)
  }, [localSlots, originalSlots, areSlotsDifferent, originalConfig, scheduleConfig])

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Keep ref in sync with state
  useEffect(() => {
    localSlotsRef.current = localSlots
  }, [localSlots])

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

  const handleReorganizeSchedule = useCallback(
    async (preserveAssignments: boolean) => {
      if (preserveAssignments) {
        // Local reorganization - no API call needed
        const dayNumbers = DAYS_OF_WEEK.map((d) => d.number)
        const currentSlots = localSlotsRef.current
        const { slots: newSlots, removedClasses: newRemovedClasses } = reorganizeSlotsLocally(
          currentSlots,
          scheduleConfig,
          dayNumbers
        )

        setLocalSlots(newSlots)
        setRemovedClasses(
          newRemovedClasses.map((r) => ({
            teacherHasClassId: r.teacherHasClass?.id ?? '',
            day: r.day,
          }))
        )
        setIsDirty(true)

        if (newRemovedClasses.length > 0) {
          const removedList = newRemovedClasses
            .map(
              (r) =>
                `${r.teacherHasClass?.subject?.name ?? 'Aula'} (${DAYS_OF_WEEK.find((d) => d.number === r.day)?.label ?? ''})`
            )
            .join(', ')
          toast.warning(`${newRemovedClasses.length} aula(s) removida(s) da grade: ${removedList}`)
        } else {
          toast.success('Grade reorganizada com sucesso!')
        }
      } else {
        // Generate from scratch - needs API call
        try {
          const result = await generateMutation.mutateAsync({
            params: { classId },
            body: {
              academicPeriodId,
              config: scheduleConfig,
              preserveAssignments: false,
            },
          } as any)

          const generatedSlots = (result as any).slots.map((slot: any) => ({
            ...slot,
            teacherHasClass: slot.teacherHasClass,
          }))

          setLocalSlots(generatedSlots)
          setIsDirty(true)
          setIsGenerateDialogOpen(false)
          toast.success('Grade gerada com sucesso!')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar grade'
          toast.error(errorMessage)
        }
      }
    },
    [academicPeriodId, classId, generateMutation, scheduleConfig]
  )

  const handleGenerateSchedule = useCallback(async () => {
    await handleReorganizeSchedule(false)
  }, [handleReorganizeSchedule])

  // Reorganize when trigger changes
  useEffect(() => {
    if (
      reorganizeTrigger !== undefined &&
      prevReorganizeTrigger.current !== reorganizeTrigger &&
      localSlots.length > 0
    ) {
      prevReorganizeTrigger.current = reorganizeTrigger
      handleReorganizeSchedule(true)
    }
  }, [reorganizeTrigger, localSlots.length, handleReorganizeSchedule])

  // Initialize local slots when data changes
  const isInitializedRef = useRef(false)
  const currentSelectionRef = useRef(`${classId}:${academicPeriodId}`)

  useEffect(() => {
    const selectionKey = `${classId}:${academicPeriodId}`
    // Reset initialization when selection changes
    if (currentSelectionRef.current !== selectionKey) {
      currentSelectionRef.current = selectionKey
      isInitializedRef.current = false
      // Reset all states for new selection
      prevReorganizeTrigger.current = reorganizeTrigger
      setRemovedClasses([])
      setIsDirty(false)
      setLocalSlots([])
      setOriginalSlots([])
      setOriginalConfig(null)
    }

    if (scheduleData?.slots && !isInitializedRef.current) {
      // Infer config from API slots instead of using prop (which may be stale)
      const inferredConfig = inferConfigFromSlots(scheduleData.slots)
      const configToUse = inferredConfig || scheduleConfig

      console.log('[DEBUG init] Using config:', configToUse, 'inferred:', !!inferredConfig)

      // Ensure we have slots for all configured time slots
      const slots = ensureConfiguredSlots(scheduleData.slots, configToUse)
      setLocalSlots(slots)
      // Save original slots and config for comparison
      setOriginalSlots(slots.map((s) => ({ ...s })))
      setOriginalConfig(configToUse)
      isInitializedRef.current = true
    }
  }, [scheduleData?.slots, classId, academicPeriodId, reorganizeTrigger, scheduleConfig])

  // Get unique time slots
  const configuredTimeSlots = useMemo(
    () => getConfiguredTimeSlots(scheduleConfig),
    [scheduleConfig]
  )
  const configuredBreakSlots = useMemo(
    () => getConfiguredBreakSlots(scheduleConfig),
    [scheduleConfig]
  )

  // Map each existing class to the best matching configured slot
  // A class belongs to the slot with the most overlap
  const { slotAssignments, orphanedSlots } = useMemo(() => {
    const assignments = new Map<string, (typeof localSlots)[number]>()
    const orphaned: typeof localSlots = []
    const MIN_OVERLAP_RATIO = 0.5

    for (const existingSlot of localSlots) {
      if (existingSlot.isBreak) continue

      const slotStart = toMinutes(existingSlot.startTime.split(':').slice(0, 2).join(':'))
      const slotEnd = toMinutes(existingSlot.endTime.split(':').slice(0, 2).join(':'))
      const slotDuration = slotEnd - slotStart

      let bestOverlap = 0
      let bestConfigSlot: string | null = null

      for (const configSlot of configuredTimeSlots) {
        const [cStart, cEnd] = configSlot.split('-')
        const cStartMin = toMinutes(cStart)
        const cEndMin = toMinutes(cEnd)

        const overlapStart = Math.max(slotStart, cStartMin)
        const overlapEnd = Math.min(slotEnd, cEndMin)
        const overlapDuration = Math.max(0, overlapEnd - overlapStart)
        const overlapRatio = overlapDuration / slotDuration

        if (overlapDuration > bestOverlap) {
          bestOverlap = overlapDuration
          if (overlapRatio >= MIN_OVERLAP_RATIO) {
            bestConfigSlot = `${existingSlot.classWeekDay}_${configSlot}`
          }
        }
      }

      if (bestConfigSlot) {
        if (!assignments.has(bestConfigSlot)) {
          assignments.set(bestConfigSlot, existingSlot)
        }
      } else {
        orphaned.push(existingSlot)
      }
    }

    console.log(
      '[DEBUG slotAssignments] Orphaned slots:',
      orphaned.length,
      orphaned.map((s) => ({
        day: s.classWeekDay,
        time: `${s.startTime}-${s.endTime}`,
        hasTeacher: !!s.teacherHasClass,
        teacherHasClassId: s.teacherHasClassId,
        subject: s.teacherHasClass?.subject?.name,
      }))
    )

    return { slotAssignments: assignments, orphanedSlots: orphaned }
  }, [localSlots, configuredTimeSlots])

  // Get pending classes (not yet scheduled enough times)
  const pendingClasses = useMemo(() => {
    if (!scheduleData?.teacherClasses) {
      return []
    }

    const scheduledByTeacherHasClassId = new Map<string, number>()
    for (const slot of localSlots) {
      if (
        !slot.isBreak &&
        slot.teacherHasClassId &&
        !orphanedSlots.some((os) => os.id === slot.id)
      ) {
        const count = scheduledByTeacherHasClassId.get(slot.teacherHasClassId) ?? 0
        scheduledByTeacherHasClassId.set(slot.teacherHasClassId, count + 1)
      }
    }

    // Add removed classes from reorganization
    const removedByTeacherHasClassId = new Map<string, number>()
    for (const removed of removedClasses) {
      if (removed.teacherHasClassId) {
        const count = removedByTeacherHasClassId.get(removed.teacherHasClassId) ?? 0
        removedByTeacherHasClassId.set(removed.teacherHasClassId, count + 1)
      }
    }

    const result = scheduleData.teacherClasses
      .map((tc) => {
        const scheduledCount = scheduledByTeacherHasClassId.get(tc.id) ?? 0
        const removedCount = removedByTeacherHasClassId.get(tc.id) ?? 0
        const totalScheduled = scheduledCount + removedCount
        const missing = tc.subjectQuantity - totalScheduled
        if (missing <= 0) return null
        return { ...tc, missing }
      })
      .filter(Boolean) as Array<TeacherHasClass & { missing: number }>

    console.log(
      '[DEBUG pendingClasses] Result:',
      result.length,
      result.map((r) => ({
        subject: r.subject.name,
        missing: r.missing,
      }))
    )

    return result
  }, [scheduleData?.teacherClasses, localSlots, removedClasses, orphanedSlots])

  const handleSave = useCallback(async () => {
    // Verificar se há alterações para salvar
    if (!isDirty) {
      toast.success('Nenhuma alteração para salvar')
      return
    }

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

    const saveInput = localSlots
      .filter((s) => {
        // Only save slots within configured time slots
        const slotTimeRange = `${normalizeTime(s.startTime)}-${normalizeTime(s.endTime)}`
        return configuredTimeSlots.includes(slotTimeRange)
      })
      .map((s) => ({
        teacherHasClassId: s.teacherHasClassId,
        classWeekDay: s.classWeekDay,
        startTime: s.startTime,
        endTime: s.endTime,
        isBreak: s.isBreak,
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log('[DEBUG handleDragStart] Started dragging:', event.active.id.toString())
    setActiveDragItem(event.active.id.toString())
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      console.log('[DEBUG handleDragEnd] Drag ended:', {
        active: event.active.id.toString(),
        over: event.over?.id.toString(),
      })
      setActiveDragItem(null)
      const { active, over } = event
      if (!active || !over || active.id === over.id) {
        console.log('[DEBUG handleDragEnd] Early return - no over or same item')
        return
      }

      // Parse slot keys
      const activeId = active.id.toString()
      const overId = over.id.toString()

      console.log('[DEBUG handleDragEnd] Processing drag:', { activeId, overId })

      // Handle pending class being dragged to a slot
      if (activeId.startsWith('pending_')) {
        console.log('[DEBUG handleDragEnd] Processing pending class drag')
        const teacherHasClassId = activeId.replace('pending_', '').split('_')[0]
        const [dayStr, timeRange] = overId.split('_')
        if (!dayStr || !timeRange) {
          console.log('[DEBUG handleDragEnd] Early return - invalid overId format')
          return
        }

        const [startTime, endTime] = timeRange.split('-')
        const dayNumber = parseInt(dayStr)

        console.log('[DEBUG handleDragEnd] Target slot:', { dayNumber, startTime, endTime })

        // Find the target slot
        const slotIndex = localSlots.findIndex(
          (s) =>
            s.classWeekDay === dayNumber &&
            normalizeTime(s.startTime) === startTime &&
            normalizeTime(s.endTime) === endTime
        )

        if (slotIndex === -1) {
          console.log('[DEBUG handleDragEnd] Slot not found in localSlots')
          return
        }

        console.log('[DEBUG handleDragEnd] Found slot at index:', slotIndex)

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
        console.log('[DEBUG handleDragEnd] Slot updated successfully')
        return
      }

      // Swap two slots
      console.log('[DEBUG handleDragEnd] Processing slot swap')
      const [activeDay, activeTime] = activeId.split('_')
      const [overDay, overTime] = overId.split('_')
      if (!activeDay || !activeTime || !overDay || !overTime) {
        console.log('[DEBUG handleDragEnd] Early return - invalid slot key format')
        return
      }

      const [activeStart, activeEnd] = activeTime.split('-')
      const [overStart, overEnd] = overTime.split('-')
      const activeDayNum = parseInt(activeDay)
      const overDayNum = parseInt(overDay)

      console.log('[DEBUG handleDragEnd] Swap details:', {
        active: { day: activeDayNum, start: activeStart, end: activeEnd },
        over: { day: overDayNum, start: overStart, end: overEnd },
        localSlotsCount: localSlots.length,
        localSlotsSample: localSlots.slice(0, 5).map((s) => ({
          day: s.classWeekDay,
          start: s.startTime,
          end: s.endTime,
          normStart: normalizeTime(s.startTime),
          normEnd: normalizeTime(s.endTime),
        })),
      })

      const activeSlotIndex = localSlots.findIndex(
        (s) =>
          s.classWeekDay === activeDayNum &&
          normalizeTime(s.startTime) === activeStart &&
          normalizeTime(s.endTime) === activeEnd
      )
      const overSlotIndex = localSlots.findIndex(
        (s) =>
          s.classWeekDay === overDayNum &&
          normalizeTime(s.startTime) === overStart &&
          normalizeTime(s.endTime) === overEnd
      )

      console.log('[DEBUG handleDragEnd] Slot indices:', { activeSlotIndex, overSlotIndex })

      if (activeSlotIndex === -1 || overSlotIndex === -1) {
        console.log('[DEBUG handleDragEnd] Early return - slot not found')
        return
      }

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
          <AlertDialogTrigger>
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
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          variant="default"
          className="relative"
        >
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          {isDirty && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-orange-500" />
            </span>
          )}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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

          <DragOverlay>
            {activeDragItem?.startsWith('pending_')
              ? (() => {
                  const teacherHasClassId = activeDragItem.replace('pending_', '').split('_')[0]
                  const teacherClass = scheduleData?.teacherClasses.find(
                    (tc) => tc.id === teacherHasClassId
                  )
                  if (teacherClass) {
                    return (
                      <Card className="cursor-move shadow-lg">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium">{teacherClass.subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {teacherClass.teacher.user.name}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  }
                  return null
                })()
              : activeDragItem &&
                  activeDragItem.includes('_') &&
                  !activeDragItem.startsWith('pending_')
                ? (() => {
                    // Grid slot being dragged
                    const [dayStr, timeRange] = activeDragItem.split('_')
                    const [startTime, endTime] = timeRange.split('-')
                    const dayNumber = parseInt(dayStr)

                    const slot = localSlots.find(
                      (s) =>
                        s.classWeekDay === dayNumber &&
                        normalizeTime(s.startTime) === startTime &&
                        normalizeTime(s.endTime) === endTime
                    )

                    if (slot?.teacherHasClass) {
                      return (
                        <TableCell className="cursor-move shadow-lg bg-primary/10 min-w-[120px]">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">
                              {slot.teacherHasClass.subject.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {slot.teacherHasClass.teacher.user.name}
                            </p>
                          </div>
                        </TableCell>
                      )
                    }
                    return (
                      <TableCell className="cursor-move shadow-lg bg-muted/30 min-w-[120px]">
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                    )
                  })()
                : null}
          </DragOverlay>

          {/* Schedule table */}
          <Card>
            <CardHeader>
              <CardTitle>Grade de Horários - {className}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {configuredTimeSlots.length === 0 ? (
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
                    {configuredTimeSlots.map((timeSlot) => {
                      const [startTime, endTime] = timeSlot.split('-')
                      const isBreak = configuredBreakSlots.has(timeSlot)
                      return (
                        <TableRow key={timeSlot}>
                          <TableCell className="font-medium">
                            {startTime} - {endTime}
                          </TableCell>
                          {DAYS_OF_WEEK.map((day) => {
                            if (isBreak) {
                              return (
                                <TableCell
                                  key={day.key}
                                  className="bg-muted text-center text-muted-foreground"
                                >
                                  INTERVALO
                                </TableCell>
                              )
                            }
                            const slotKey = `${day.number}_${timeSlot}`
                            const slot = slotAssignments.get(slotKey)
                            return (
                              <ScheduleSlotCell
                                key={day.key}
                                slotId={slotKey}
                                teacherHasClass={slot?.teacherHasClass}
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
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.8 : 1,
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
    transform: CSS.Transform.toString(
      transform
        ? { ...transform, scaleX: isDragging ? 1.05 : 1, scaleY: isDragging ? 1.05 : 1 }
        : transform
    ),
    transition: transition || 'transform 200ms ease, opacity 200ms ease',
    zIndex: isDragging ? 50 : undefined,
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
