import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Calendar,
  CheckCircle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'
import { ErrorBoundary } from '~/components/error-boundary'

const schema = z.object({
  dates: z.array(z.string()).min(1, 'Selecione pelo menos uma data'),
  subjectId: z.string().min(1, 'Selecione a matéria'),
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
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Student {
  id: string
  user: {
    name: string
  }
}

interface Subject {
  id: string
  name: string
  teacherId: string
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

async function fetchStudentsForClass(classId: string): Promise<Student[]> {
  const response = await fetch(`/api/v1/classes/${classId}/students?limit=1000`)
  if (!response.ok) {
    throw new Error('Failed to fetch students')
  }
  const data = await response.json()
  // Handle both array and paginated response formats
  if (Array.isArray(data)) return data
  if (Array.isArray(data.data)) return data.data
  return []
}

async function fetchSubjectsForClass(classId: string): Promise<Subject[]> {
  const response = await fetch(`/api/v1/classes/${classId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch class data')
  }
  const data = await response.json()

  const subjects: Subject[] = []
  const seen = new Set<string>()

  for (const tc of data.teacherClasses || []) {
    if (tc.subject && !seen.has(tc.subject.id)) {
      seen.add(tc.subject.id)
      subjects.push({
        id: tc.subject.id,
        name: tc.subject.name,
        teacherId: tc.teacherId,
      })
    }
  }

  return subjects
}

interface AvailableDate {
  date: string
  label: string
}

async function fetchAvailableDates(
  classId: string,
  academicPeriodId: string,
  subjectId: string
): Promise<AvailableDate[]> {
  const params = new URLSearchParams({
    classId,
    academicPeriodId,
    subjectId,
  })
  const response = await fetch(
    `/api/v1/attendance/available-dates?${params.toString()}`
  )
  if (!response.ok) {
    throw new Error('Falha ao carregar dias de aula')
  }
  const data = (await response.json()) as { dates: AvailableDate[] }
  return data.dates ?? []
}

interface BatchAttendancePayload {
  classId: string
  academicPeriodId: string
  subjectId: string
  dates: string[]
  attendances: {
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED'
  }[]
}

async function createBatchAttendance(payload: BatchAttendancePayload): Promise<void> {
  const response = await fetch('/api/v1/attendance/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || 'Falha ao registrar presença')
  }
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

function NewAttendanceModalContent({
  classId,
  academicPeriodId,
  open,
  onOpenChange,
}: NewAttendanceModalProps) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dates: [],
      subjectId: '',
      attendances: [],
    },
  })

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => fetchStudentsForClass(classId),
    enabled: open,
  })

  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['class-subjects', classId],
    queryFn: () => fetchSubjectsForClass(classId),
    enabled: open,
  })

  const subjectId = form.watch('subjectId')
  const { data: availableDates = [], isLoading: isLoadingDates } = useQuery({
    queryKey: ['attendance-available-dates', classId, academicPeriodId, subjectId],
    queryFn: () =>
      fetchAvailableDates(classId, academicPeriodId, subjectId),
    enabled: open && !!subjectId,
  })

  // Auto-select first subject if only one
  useEffect(() => {
    if (subjects && subjects.length === 1 && subjects[0]) {
      form.setValue('subjectId', subjects[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects])

  // When subject changes, clear date selection
  useEffect(() => {
    if (subjectId) {
      form.setValue('dates', [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  // Initialize attendances when students are loaded
  useEffect(() => {
    if (!students || !Array.isArray(students)) return
    const attendances = students.map((student) => ({
      student: {
        id: student.id,
        name: student.user?.name || 'Nome não disponível',
      },
      status: 'PRESENT' as const,
    }))
    form.setValue('attendances', attendances)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students])

  // Reset form when modal opens
  useEffect(() => {
    if (open && students && Array.isArray(students) && students.length > 0) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, students])

  const createMutation = useMutation({
    mutationFn: createBatchAttendance,
    onSuccess: () => {
      toast.success('Presença registrada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['class-students-attendance', classId] })
      queryClient.invalidateQueries({
        queryKey: ['attendance-available-dates', classId, academicPeriodId, subjectId],
      })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao registrar presença')
    },
  })

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
      form.setValue('dates', current.filter((d) => d !== date))
    } else {
      form.setValue('dates', [...current, date])
    }
  }

  // Select/deselect all dates
  function selectAllDates() {
    form.setValue('dates', availableDates.map((d) => d.date))
  }

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
    const current = form.getValues(`attendances.${index}.status`)
    const newStatus = current === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    form.setValue(`attendances.${index}.status`, newStatus)
  }

  async function onSubmit(data: FormValues) {
    const attendances = data.attendances.map((a) => ({
      studentId: a.student.id,
      status: (a.status === 'EXCUSED' ? 'JUSTIFIED' : a.status) as 'PRESENT' | 'ABSENT' | 'LATE' | 'JUSTIFIED',
    }))

    // Send single request with all dates
    await createMutation.mutateAsync({
      classId,
      academicPeriodId,
      subjectId: data.subjectId,
      dates: data.dates,
      attendances,
    })
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Subject Select — first, like school-super-app */}
            <div className="space-y-2">
              <Label>Matéria *</Label>
              {isLoadingSubjects ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando matérias...
                </div>
              ) : (
                <Select
                  value={form.watch('subjectId')}
                  onValueChange={(value) => form.setValue('subjectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.subjectId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.subjectId.message}
                </p>
              )}
            </div>

            {/* Date Selection — multiple dates allowed */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Datas das Aulas
                {selectedDates.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDates.length} selecionada{selectedDates.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </Label>
              {!subjectId ? (
                <p className="text-sm text-muted-foreground">
                  Selecione a matéria para ver os dias de aula.
                </p>
              ) : isLoadingDates ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando dias de aula...
                </div>
              ) : availableDates.length === 0 ? (
                <p className="text-sm text-destructive">
                  Nenhum dia de aula para esta matéria. Verifique o quadro de horários
                  e o período letivo.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllDates}
                    >
                      Selecionar Todas
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={deselectAllDates}
                    >
                      Limpar
                    </Button>
                  </div>
                  <div className="h-[120px] overflow-y-auto rounded-md border p-2">
                    <div className="space-y-2">
                      {availableDates.map((d) => (
                        <label
                          key={d.date}
                          className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDates.includes(d.date)}
                            onChange={() => toggleDate(d.date)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm">{d.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {form.formState.errors.dates && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dates.message}
                </p>
              )}
            </div>

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
                            <Badge variant="destructive" className="text-xs">Ausente</Badge>
                          )}
                          <input
                            type="checkbox"
                            checked={isPresent}
                            onChange={() => toggleAttendance(originalIndex)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300"
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
              onClick={form.handleSubmit(onSubmit)}
              disabled={
                createMutation.isPending ||
                !subjectId ||
                selectedDates.length === 0
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
