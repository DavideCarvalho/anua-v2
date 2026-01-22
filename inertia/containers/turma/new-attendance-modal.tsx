import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  CheckCircle,
  Search,
  Users,
  X,
  XCircle,
  Loader2,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
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
import { ScrollArea } from '~/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DatePicker } from '~/components/ui/date-picker'
import { cn } from '~/lib/utils'
import { ErrorBoundary } from '~/components/error-boundary'

const schema = z.object({
  date: z.date(),
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

interface BatchAttendancePayload {
  classId: string
  academicPeriodId: string
  subjectId: string
  date: string
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
      date: new Date(),
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

  // Auto-select first subject if only one
  useEffect(() => {
    if (subjects && subjects.length === 1 && subjects[0]) {
      form.setValue('subjectId', subjects[0].id)
    }
  }, [subjects, form])

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
  }, [students, form])

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
      form.setValue('date', new Date())
      setSearchQuery('')
    }
  }, [open, students, form])

  const createMutation = useMutation({
    mutationFn: createBatchAttendance,
    onSuccess: () => {
      toast.success('Presença registrada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['class-students-attendance', classId] })
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

  function onSubmit(data: FormValues) {
    createMutation.mutate({
      classId,
      academicPeriodId,
      subjectId: data.subjectId,
      date: data.date.toISOString(),
      attendances: data.attendances.map((a) => ({
        studentId: a.student.id,
        status: a.status === 'EXCUSED' ? 'JUSTIFIED' : a.status,
      })),
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
      <DialogContent className="max-h-[90vh] max-w-full p-0 sm:max-w-[700px] sm:p-6">
        <div className="sticky top-0 z-10 space-y-4 bg-background p-4 sm:relative sm:p-0">
          <DialogHeader>
            <DialogTitle>Registrar Presença</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Data da Aula</Label>
              <DatePicker
                date={form.watch('date')}
                onChange={(date) => {
                  if (date) form.setValue('date', date)
                }}
              />
            </div>

            {/* Subject Select */}
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
          </form>
        </div>

        {/* Student List */}
        <div className="overflow-y-auto px-4 sm:px-0">
          {isLoadingStudents ? (
            <AttendanceSkeleton />
          ) : studentsAttendances.length === 0 ? (
            <NoStudentsEmpty />
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredStudents.map((attendance) => {
                  // Find the original index for form control
                  const originalIndex = studentsAttendances.findIndex(
                    (a) => a.student.id === attendance.student.id
                  )
                  const isPresent = form.watch(`attendances.${originalIndex}.status`) === 'PRESENT'

                  return (
                    <Card
                      key={attendance.student.id}
                      className={cn(
                        'cursor-pointer border-l-4 transition-all hover:shadow-md',
                        isPresent
                          ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
                          : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                      )}
                      onClick={() => toggleAttendance(originalIndex)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getInitials(attendance.student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{attendance.student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isPresent ? (
                            <Badge className="bg-green-500">Presente</Badge>
                          ) : (
                            <Badge variant="destructive">Ausente</Badge>
                          )}
                          <Checkbox
                            checked={isPresent}
                            onCheckedChange={() => toggleAttendance(originalIndex)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 border-t bg-background p-4 sm:relative sm:border-0 sm:p-0">
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
              disabled={createMutation.isPending || !form.watch('subjectId')}
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
