import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import { cn } from '~/lib/utils'
import { ErrorBoundary } from '~/components/error-boundary'

import { api } from '~/lib/api'

const schema = z.object({
  dates: z.array(z.string()).min(1, 'Selecione pelo menos uma data'),
  subjectIds: z.array(z.string()).min(1, 'Selecione pelo menos uma matéria'),
  attendances: z.array(
    z.object({
      student: z.object({
        id: z.string(),
        name: z.string(),
      }),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    })
  ),
})

type FormValues = z.infer<typeof schema>

interface NewAttendanceModalProps {
  classId: string
  academicPeriodId: string
  courseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Subject {
  id: string
  name: string
  teacherId: string
}

interface AvailableDate {
  date: string
  label: string
  slotId: string
}

// Helper function to get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Loading skeleton component
function AttendanceSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Empty state component
function NoStudentsEmpty() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno cadastrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta turma ainda não possui alunos matriculados.
        </p>
      </CardContent>
    </Card>
  )
}

// Calendar-based date picker component
interface DateCalendarPickerProps {
  availableDates: AvailableDate[]
  selectedDates: string[]
  onToggleDate: (date: string) => void
  onClear: () => void
  isLoading: boolean
  hasSubjectsSelected: boolean
  error?: string
}

function DateCalendarPicker({
  availableDates,
  selectedDates,
  onToggleDate,
  onClear,
  isLoading,
  hasSubjectsSelected,
  error,
}: DateCalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  // Group dates by day
  const datesByDay = useMemo(() => {
    const grouped = new Map<string, AvailableDate[]>()
    for (const date of availableDates) {
      const dayKey = date.date.split('T')[0]
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, [])
      }
      grouped.get(dayKey)!.push(date)
    }
    return grouped
  }, [availableDates])

  // Get unique days that have classes
  const classDays = useMemo(() => {
    return new Set(datesByDay.keys())
  }, [datesByDay])

  // Check selection status for a day
  const getDaySelectionStatus = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd')
    const dayDates = datesByDay.get(dayKey) || []
    if (dayDates.length === 0) return 'none'

    const selectedCount = dayDates.filter((d) => selectedDates.includes(d.date)).length
    if (selectedCount === 0) return 'none'
    if (selectedCount === dayDates.length) return 'all'
    return 'partial'
  }

  // Get counts for a day
  const getDayCounts = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd')
    const dayDates = datesByDay.get(dayKey) || []
    const selectedCount = dayDates.filter((d) => selectedDates.includes(d.date)).length
    return { selected: selectedCount, total: dayDates.length }
  }

  // Handle day click
  const handleDayClick = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd')
    if (datesByDay.has(dayKey)) {
      setSelectedDay(date)
    }
  }

  // Toggle all times for selected day
  const toggleAllForDay = (selectAll: boolean) => {
    if (!selectedDay) return
    const dayKey = format(selectedDay, 'yyyy-MM-dd')
    const dayDates = datesByDay.get(dayKey) || []

    if (selectAll) {
      dayDates.forEach((d) => {
        if (!selectedDates.includes(d.date)) {
          onToggleDate(d.date)
        }
      })
    } else {
      dayDates.forEach((d) => {
        if (selectedDates.includes(d.date)) {
          onToggleDate(d.date)
        }
      })
    }
  }

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  if (!hasSubjectsSelected) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Datas das Aulas
        </Label>
        <p className="text-sm text-muted-foreground">
          Selecione a matéria para ver os dias de aula.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Datas das Aulas
        </Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dias de aula...
        </div>
      </div>
    )
  }

  if (availableDates.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Datas das Aulas
        </Label>
        <p className="text-sm text-destructive">
          Nenhum dia de aula para esta matéria. Verifique o quadro de horários e o período letivo.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Datas das Aulas
          {selectedDates.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedDates.length} horário{selectedDates.length > 1 ? 's' : ''}
            </Badge>
          )}
        </Label>
        {selectedDates.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-3">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10" />
              }

              const dayKey = format(date, 'yyyy-MM-dd')
              const hasClass = classDays.has(dayKey)
              const selectionStatus = getDaySelectionStatus(date)
              const counts = getDayCounts(date)
              const isSelectedDay = selectedDay && format(selectedDay, 'yyyy-MM-dd') === dayKey

              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => hasClass && handleDayClick(date)}
                  disabled={!hasClass}
                  className={cn(
                    'h-10 w-full rounded-md text-sm relative flex flex-col items-center justify-center transition-colors',
                    !hasClass && 'text-muted-foreground/30 cursor-default',
                    hasClass && 'hover:bg-accent cursor-pointer',
                    selectionStatus === 'all' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90',
                    selectionStatus === 'partial' && 'ring-2 ring-primary ring-offset-1',
                    isSelectedDay && 'ring-2 ring-blue-400 ring-offset-2',
                    hasClass &&
                      selectionStatus === 'none' &&
                      'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  )}
                >
                  <span className="text-xs font-medium">{date.getDate()}</span>
                  {hasClass && (
                    <span className="text-[9px] leading-none mt-0.5">
                      {selectionStatus === 'all'
                        ? '✓'
                        : selectionStatus === 'partial'
                          ? `${counts.selected}/${counts.total}`
                          : counts.total}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-blue-50 border border-blue-200 dark:bg-blue-950" />
              <span>Com aula</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>Selecionado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm ring-2 ring-primary" />
              <span>Parcial</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Panel */}
      {selectedDay && (
        <Card>
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">
                {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDay(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const counts = getDayCounts(selectedDay)
                  const status = getDaySelectionStatus(selectedDay)
                  if (status === 'all') return 'Todos os horários selecionados'
                  if (status === 'partial')
                    return `${counts.selected} de ${counts.total} selecionados`
                  return `${counts.total} horários disponíveis`
                })()}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAllForDay(getDaySelectionStatus(selectedDay) !== 'all')}
              >
                {getDaySelectionStatus(selectedDay) === 'all' ? 'Desmarcar todos' : 'Marcar todos'}
              </Button>
            </div>

            <div className="space-y-2">
              {(datesByDay.get(format(selectedDay, 'yyyy-MM-dd')) || []).map((dateInfo) => (
                <label
                  key={dateInfo.date}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent',
                    selectedDates.includes(dateInfo.date) && 'border-primary bg-primary/5'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedDates.includes(dateInfo.date)}
                    onChange={() => onToggleDate(dateInfo.date)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="flex-1 text-sm">{dateInfo.label}</span>
                  {selectedDates.includes(dateInfo.date) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function NewAttendanceModalContent({
  classId,
  academicPeriodId,
  courseId: _courseId,
  open,
  onOpenChange,
}: NewAttendanceModalProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dates: [],
      subjectIds: [],
      attendances: [],
    },
  })

  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    ...api.api.v1.classes.students.queryOptions({
      params: { id: classId },
      query: { courseId: _courseId, academicPeriodId },
    }),
    enabled: open,
  })
  const students = useMemo(() => studentsResponse?.data ?? [], [studentsResponse?.data])

  const { data: classData, isLoading: isLoadingSubjects } = useQuery({
    ...api.api.v1.classes.show.queryOptions({ params: { id: classId } }),
    enabled: open,
  })

  const subjects = useMemo(() => {
    const result: Subject[] = []
    const seen = new Set<string>()

    for (const tc of classData?.teacherClasses || []) {
      if (tc.subject && !seen.has(tc.subject.id)) {
        seen.add(tc.subject.id)
        result.push({
          id: tc.subject.id,
          name: tc.subject.name,
          teacherId: tc.teacherId,
        })
      }
    }

    return result
  }, [classData])

  const subjectIds = form.watch('subjectIds')
  const { data: availableDatesResponse, isLoading: isLoadingDates } = useQuery({
    ...api.api.v1.attendance.availableDates.queryOptions({
      query: { classId, academicPeriodId, subjectIds },
    }),
    enabled: open && subjectIds.length > 0,
  })
  const availableDates = useMemo(
    () => availableDatesResponse?.dates ?? [],
    [availableDatesResponse]
  )

  // Auto-select first subject if only one
  useEffect(() => {
    if (subjects && subjects.length === 1 && subjects[0]) {
      form.setValue('subjectIds', [subjects[0].id])
    }
  }, [subjects, form])

  // When subject changes, clear date selection
  useEffect(() => {
    if (subjectIds.length > 0) {
      form.setValue('dates', [])
    }
  }, [subjectIds.join(','), form])

  // Track if we've initialized for current modal open
  const [hasInitialized, setHasInitialized] = useState(false)

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!open) {
      setHasInitialized(false)
    }
  }, [open])

  // Initialize attendances when modal opens and students are loaded
  useEffect(() => {
    if (!open || hasInitialized || students.length === 0) return

    const attendances = students.map((student) => ({
      student: {
        id: student.id,
        name: student.user?.name || 'Nome não disponível',
      },
      status: 'PRESENT' as const,
    }))
    form.setValue('attendances', attendances)
    form.setValue('dates', [])
    setSearchQuery('')
    setHasInitialized(true)
  }, [open, students, hasInitialized, form])

  const createMutation = useMutation(api.api.v1.attendance.batch.mutationOptions())

  const studentsAttendances = form.watch('attendances')

  // Computed values for statistics
  const presentCount = useMemo(
    () => studentsAttendances.filter((a) => a.status === 'PRESENT').length,
    [studentsAttendances]
  )

  const absentCount = useMemo(
    () => studentsAttendances.filter((a) => a.status === 'ABSENT').length,
    [studentsAttendances]
  )

  const attendancePercentage = useMemo(() => {
    if (studentsAttendances.length === 0) return 0
    return Math.round((presentCount / studentsAttendances.length) * 100)
  }, [presentCount, studentsAttendances.length])

  // Filtered students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsAttendances
    return studentsAttendances.filter((attendance) =>
      attendance.student.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [studentsAttendances, searchQuery])

  // Watch the dates value
  const selectedDates = form.watch('dates')

  // Toggle date selection
  function toggleDate(date: string) {
    const current = form.getValues('dates')
    if (current.includes(date)) {
      form.setValue(
        'dates',
        current.filter((d) => d !== date)
      )
    } else {
      form.setValue('dates', [...current, date])
    }
  }

  // Deselect all dates
  function deselectAllDates() {
    form.setValue('dates', [])
  }

  // Quick action functions
  function markAllPresent() {
    const updated = studentsAttendances.map((a) => ({
      ...a,
      status: 'PRESENT' as const,
    }))
    form.setValue('attendances', updated)
  }

  function markAllAbsent() {
    const updated = studentsAttendances.map((a) => ({
      ...a,
      status: 'ABSENT' as const,
    }))
    form.setValue('attendances', updated)
  }

  function toggleAttendance(index: number) {
    const currentAttendances = form.getValues('attendances')
    const currentStatus = currentAttendances[index].status
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT'

    const updatedAttendances = currentAttendances.map((attendance, i) =>
      i === index
        ? ({ ...attendance, status: newStatus } as (typeof currentAttendances)[number])
        : attendance
    )

    form.setValue('attendances', updatedAttendances, { shouldDirty: true, shouldTouch: true })
  }

  async function onSubmit(data: FormValues) {
    const attendances = data.attendances.map((a) => ({
      studentId: a.student.id,
      status: (a.status === 'EXCUSED' ? 'JUSTIFIED' : a.status) as
        | 'PRESENT'
        | 'ABSENT'
        | 'LATE'
        | 'JUSTIFIED',
    }))

    await createMutation.mutateAsync({
      body: {
        classId,
        academicPeriodId,
        subjectIds: data.subjectIds,
        dates: data.dates.map((d) => new Date(d).toISOString()),
        attendances,
      },
    })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: api.api.v1.attendance.classStudents.pathKey() }),
      queryClient.invalidateQueries({ queryKey: api.api.v1.attendance.availableDates.pathKey() }),
      queryClient.invalidateQueries({ queryKey: api.api.v1.classes.students.pathKey() }),
      queryClient.invalidateQueries({ queryKey: api.api.v1.classes.show.pathKey() }),
    ])
    toast.success('Presença registrada com sucesso!')
    onOpenChange(false)
    form.reset()
  }

  // Attendance statistics component
  function AttendanceStats() {
    return (
      <Card className="mb-4 bg-muted/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-green-500">
                {presentCount} Presentes
              </Badge>
              <Badge variant="destructive">{absentCount} Ausentes</Badge>
              <Badge variant="outline">Total: {studentsAttendances.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={attendancePercentage} className="w-24" />
              <span className="text-sm font-medium">{attendancePercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-full flex-col p-0 sm:max-w-[700px]">
        <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
          <DialogTitle>Registrar Presença</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <form
            id="attendance-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Subject Select */}
            <div className="space-y-2">
              <Label>Matérias *</Label>
              {isLoadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando matérias...
                </div>
              ) : (
                <Card>
                  <CardContent className="space-y-2 p-3">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma matéria disponível.</p>
                    ) : (
                      subjects.map((subject) => {
                        const checked = subjectIds.includes(subject.id)
                        return (
                          <label
                            key={subject.id}
                            className={cn(
                              'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent',
                              checked && 'border-primary bg-primary/5'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = form.getValues('subjectIds')
                                if (checked) {
                                  form.setValue(
                                    'subjectIds',
                                    current.filter((id) => id !== subject.id)
                                  )
                                  return
                                }
                                form.setValue('subjectIds', [...current, subject.id])
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">{subject.name}</span>
                          </label>
                        )
                      })
                    )}
                  </CardContent>
                </Card>
              )}
              {form.formState.errors.subjectIds && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subjectIds.message}
                </p>
              )}
            </div>

            {/* Date Selection - Calendar */}
            <DateCalendarPicker
              availableDates={availableDates}
              selectedDates={selectedDates}
              onToggleDate={toggleDate}
              onClear={deselectAllDates}
              isLoading={isLoadingDates}
              hasSubjectsSelected={subjectIds.length > 0}
              error={form.formState.errors.dates?.message}
            />

            {/* Statistics */}
            {studentsAttendances.length > 0 && <AttendanceStats />}

            {/* Quick Actions */}
            {studentsAttendances.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={markAllPresent}
                  className="flex-1 sm:flex-none"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marcar Todos Presentes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={markAllAbsent}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Marcar Todos Ausentes
                </Button>
              </div>
            )}

            {/* Search Bar */}
            {studentsAttendances.length > 0 && (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-6 w-6 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {filteredStudents.length} de {studentsAttendances.length} alunos
                  </p>
                )}
              </div>
            )}

            {/* Student List */}
            <div className="space-y-2">
              <Label>Alunos</Label>
              {isLoadingStudents ? (
                <AttendanceSkeleton />
              ) : studentsAttendances.length === 0 ? (
                <NoStudentsEmpty />
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((attendance) => {
                    const originalIndex = studentsAttendances.findIndex(
                      (a) => a.student.id === attendance.student.id
                    )
                    const isPresent = attendance.status === 'PRESENT'

                    return (
                      <div
                        key={attendance.student.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-lg border-l-4 p-3 transition-all hover:bg-muted/50',
                          isPresent
                            ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                            : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                        )}
                        onClick={() => toggleAttendance(originalIndex)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {getInitials(attendance.student.name)}
                          </div>
                          <span className="text-sm font-medium">{attendance.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPresent ? (
                            <Badge className="bg-green-500 text-xs">Presente</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Ausente
                            </Badge>
                          )}
                          <input
                            type="checkbox"
                            checked={isPresent}
                            readOnly
                            className="h-4 w-4 rounded border-gray-300 pointer-events-none"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t px-4 py-4 sm:px-6">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="attendance-form"
              disabled={
                createMutation.isPending || subjectIds.length === 0 || selectedDates.length === 0
              }
              className="flex-1 sm:flex-none"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewAttendanceModal(props: NewAttendanceModalProps) {
  return (
    <ErrorBoundary>
      <NewAttendanceModalContent {...props} />
    </ErrorBoundary>
  )
}
