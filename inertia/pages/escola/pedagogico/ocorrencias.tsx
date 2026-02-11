import { Head } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Plus, Search, Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Skeleton } from '~/components/ui/skeleton'
import {
  useOccurrencesQueryOptions,
  useOccurrenceTeacherClassesQueryOptions,
  useOccurrenceDetailQueryOptions,
} from '~/hooks/queries/use_occurrences'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useStudentsQueryOptions } from '~/hooks/queries/use_students'
import { useCreateOccurrence } from '~/hooks/mutations/use_occurrence_mutations'
import {
  brazilianDateFormatter,
  formatSegmentName,
  getEducationType,
  getCourseLabels,
  getLevelLabels,
  type AcademicPeriodSegment,
} from '~/lib/formatters'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet'

const TYPE_OPTIONS = [
  { value: 'BEHAVIOR', label: 'Comportamento' },
  { value: 'PERFORMANCE', label: 'Desempenho' },
  { value: 'ABSENCE', label: 'Falta' },
  { value: 'LATE', label: 'Atraso' },
  { value: 'OTHER', label: 'Outro' },
] as const

const schema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  teacherHasClassId: z.string().min(1, 'Selecione turma e materia'),
  type: z.enum(['BEHAVIOR', 'PERFORMANCE', 'ABSENCE', 'LATE', 'OTHER']),
  date: z.string().min(1, 'Informe a data'),
  text: z.string().min(3, 'Descreva a ocorrencia').max(2000, 'Texto muito longo'),
})

type FormValues = z.infer<typeof schema>

function NewOccurrenceModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateOccurrence()
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      studentId: '',
      teacherHasClassId: '',
      type: 'BEHAVIOR',
      date: new Date().toISOString().split('T')[0],
      text: '',
    },
  })

  const { data: studentsData } = useQuery({
    ...useStudentsQueryOptions({ page: 1, limit: 200 }),
    enabled: open,
  })
  const { data: academicPeriodsData } = useQuery({
    ...useAcademicPeriodsQueryOptions({ page: 1, limit: 100, isActive: true }),
    enabled: open,
  })
  const { data: periodCoursesData } = useQuery({
    ...useAcademicPeriodCoursesQueryOptions(selectedAcademicPeriodId, { isActive: true }),
    enabled: open && Boolean(selectedAcademicPeriodId),
  })
  const { data: teacherClassesData } = useQuery({
    ...useOccurrenceTeacherClassesQueryOptions({
      academicPeriodId: selectedAcademicPeriodId || undefined,
    }),
    enabled: open,
  })

  const students = studentsData?.data ?? []
  const academicPeriods = academicPeriodsData?.data ?? []
  const courses = periodCoursesData ?? []
  const teacherClasses = teacherClassesData?.data ?? []

  const selectedPeriod = academicPeriods.find(
    (period: any) => period.id === selectedAcademicPeriodId
  )
  const segment = (selectedPeriod?.segment as AcademicPeriodSegment | undefined) || 'ELEMENTARY'
  const isFormalEducation = getEducationType(segment) === 'formal'
  const courseLabels = getCourseLabels(segment)
  const levelLabels = getLevelLabels(segment)

  const academicPeriodOptions = academicPeriods.map((period: any) => ({
    value: period.id,
    label: period.name,
    description: formatSegmentName(period.segment),
  }))

  const courseOptions = courses.map((course: any) => ({
    value: course.courseId,
    label: course.name,
  }))

  const selectedCourse = courses.find((course: any) => course.courseId === selectedCourseId)
  const levelOptions = (selectedCourse?.levels ?? []).map((level: any) => ({
    value: level.levelId,
    label: level.name,
  }))

  const selectedLevel = selectedCourse?.levels?.find(
    (level: any) => level.levelId === selectedLevelId
  )

  const classOptions = useMemo(() => {
    const uniqueClasses = new Map<string, string>()

    for (const item of selectedLevel?.classes ?? []) {
      uniqueClasses.set(item.id, item.name)
    }

    return Array.from(uniqueClasses.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [selectedLevel?.classes])

  const teacherClassOptions = teacherClasses
    .filter((item) => (selectedClassId ? item.class.id === selectedClassId : true))
    .map((item) => ({
      value: item.id,
      label: `${item.subject.name} (${item.teacher.name})`,
      description: item.class.name,
    }))

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return students
    return students.filter((student: any) => student.classId === selectedClassId)
  }, [students, selectedClassId])

  useEffect(() => {
    if (!selectedAcademicPeriodId) return
    if (!isFormalEducation) return
    if (selectedCourseId) return
    if (!courses.length) return

    setSelectedCourseId(courses[0].courseId)
  }, [selectedAcademicPeriodId, isFormalEducation, selectedCourseId, courses])

  useEffect(() => {
    if (!open) {
      setSelectedAcademicPeriodId('')
      setSelectedCourseId('')
      setSelectedLevelId('')
      setSelectedClassId('')
      form.reset({
        studentId: '',
        teacherHasClassId: '',
        type: 'BEHAVIOR',
        date: new Date().toISOString().split('T')[0],
        text: '',
      })
    }
  }, [open, form])

  const onSubmit = (values: FormValues) => {
    if (!selectedAcademicPeriodId) {
      toast.error('Selecione o periodo letivo')
      return
    }

    if (!selectedCourseId) {
      toast.error(`Selecione ${courseLabels.definite.toLowerCase()}`)
      return
    }

    if (!selectedLevelId) {
      toast.error(`Selecione ${levelLabels.definite.toLowerCase()}`)
      return
    }

    if (!selectedClassId) {
      toast.error('Selecione a turma')
      return
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Ocorrencia registrada com sucesso')
        form.reset({
          studentId: '',
          teacherHasClassId: '',
          type: 'BEHAVIOR',
          date: new Date().toISOString().split('T')[0],
          text: '',
        })
        setSelectedAcademicPeriodId('')
        setSelectedCourseId('')
        setSelectedLevelId('')
        setSelectedClassId('')
        onOpenChange(false)
      },
      onError: (error: any) => {
        toast.error(error?.message || 'Erro ao registrar ocorrencia')
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova ocorrencia</DialogTitle>
          <DialogDescription>Registre uma ocorrencia e notifique os responsaveis</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Periodo letivo</Label>
            <SearchableSingleSelect
              value={selectedAcademicPeriodId}
              onValueChange={(value) => {
                setSelectedAcademicPeriodId(value)
                setSelectedCourseId('')
                setSelectedLevelId('')
                setSelectedClassId('')
                form.setValue('teacherHasClassId', '')
                form.setValue('studentId', '')
              }}
              options={academicPeriodOptions}
              placeholder="Selecione"
              searchPlaceholder="Buscar periodo letivo..."
              emptyMessage="Nenhum periodo encontrado"
            />
          </div>

          {!isFormalEducation && (
            <div className="space-y-2">
              <Label>{courseLabels.singular}</Label>
              <SearchableSingleSelect
                value={selectedCourseId}
                onValueChange={(value) => {
                  setSelectedCourseId(value)
                  setSelectedLevelId('')
                  setSelectedClassId('')
                  form.setValue('teacherHasClassId', '')
                  form.setValue('studentId', '')
                }}
                options={courseOptions}
                placeholder="Selecione"
                searchPlaceholder={`Buscar ${courseLabels.lowercase}...`}
                emptyMessage={`Nenhum ${courseLabels.lowercase} encontrado`}
                disabled={!selectedAcademicPeriodId}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>{levelLabels.singular}</Label>
            <SearchableSingleSelect
              value={selectedLevelId}
              onValueChange={(value) => {
                setSelectedLevelId(value)
                setSelectedClassId('')
                form.setValue('teacherHasClassId', '')
                form.setValue('studentId', '')
              }}
              options={levelOptions}
              placeholder="Selecione"
              searchPlaceholder={`Buscar ${levelLabels.lowercase}...`}
              emptyMessage={`Nenhum ${levelLabels.lowercase} encontrado`}
              disabled={!selectedCourseId}
            />
          </div>

          <div className="space-y-2">
            <Label>Turma</Label>
            <SearchableSingleSelect
              value={selectedClassId}
              onValueChange={(value) => {
                setSelectedClassId(value)
                form.setValue('teacherHasClassId', '')
                form.setValue('studentId', '')
              }}
              options={classOptions}
              placeholder="Selecione"
              searchPlaceholder="Buscar turma..."
              emptyMessage="Nenhuma turma encontrada"
              disabled={!selectedLevelId}
            />
          </div>

          <div className="space-y-2">
            <Label>Materia e professor</Label>
            <SearchableSingleSelect
              value={form.watch('teacherHasClassId')}
              onValueChange={(value) => {
                form.setValue('teacherHasClassId', value)
                form.setValue('studentId', '')
              }}
              options={teacherClassOptions}
              placeholder="Selecione"
              searchPlaceholder="Buscar materia ou professor..."
              emptyMessage="Nenhuma combinacao encontrada"
              disabled={!selectedClassId}
            />
            {form.formState.errors.teacherHasClassId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.teacherHasClassId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Aluno</Label>
            <SearchableSingleSelect
              value={form.watch('studentId')}
              onValueChange={(value) => form.setValue('studentId', value)}
              options={filteredStudents.map((student: any) => ({
                value: student.id,
                label: student.user?.name || student.id,
                description: student.user?.email,
              }))}
              placeholder="Selecione"
              searchPlaceholder="Buscar aluno..."
              emptyMessage="Nenhum aluno encontrado"
              disabled={!selectedClassId || !form.watch('teacherHasClassId')}
            />
            {form.formState.errors.studentId && (
              <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => form.setValue('type', value as FormValues['type'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" {...form.register('date')} />
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descricao</Label>
            <Textarea rows={5} placeholder="Descreva o ocorrido..." {...form.register('text')} />
            {form.formState.errors.text && (
              <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar ocorrencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SearchableSingleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled,
}: {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string; description?: string }>
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options

    const normalizedSearch = search.toLowerCase()
    return options.filter((option) => {
      const label = option.label.toLowerCase()
      const description = option.description?.toLowerCase() || ''
      return label.includes(normalizedSearch) || description.includes(normalizedSearch)
    })
  }, [options, search])

  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-start font-normal"
          disabled={disabled}
        >
          <span className="truncate">{selected?.label || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onValueChange(option.value)
                  setOpen(false)
                  setSearch('')
                }}
              >
                <p className="truncate">{option.label}</p>
                {option.description ? (
                  <p className="truncate text-xs text-muted-foreground">{option.description}</p>
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function typeLabel(type: string) {
  return TYPE_OPTIONS.find((option) => option.value === type)?.label || type
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

export default function OcorrenciasPage() {
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    type: parseAsString,
    academicPeriodId: parseAsString,
    classId: parseAsString,
    studentId: parseAsString,
    startDate: parseAsString,
    endDate: parseAsString,
    orderBy: parseAsString.withDefault('date'),
    direction: parseAsString.withDefault('desc'),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, type, academicPeriodId, classId, studentId, startDate, endDate, page, limit } =
    filters

  const orderBy =
    filters.orderBy === 'student' ||
    filters.orderBy === 'class' ||
    filters.orderBy === 'type' ||
    filters.orderBy === 'date'
      ? filters.orderBy
      : 'date'

  const direction =
    filters.direction === 'asc' || filters.direction === 'desc' ? filters.direction : 'desc'

  const [searchInput, setSearchInput] = useState(search ?? '')
  const debouncedSearch = useDebounce(searchInput, 350)
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null)

  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  useEffect(() => {
    void setFilters({ search: debouncedSearch ? debouncedSearch : null, page: 1 })
  }, [debouncedSearch, setFilters])

  const { data: teacherClassesData } = useQuery(
    useOccurrenceTeacherClassesQueryOptions({
      academicPeriodId:
        academicPeriodId && academicPeriodId !== 'all' ? academicPeriodId : undefined,
    })
  )
  const { data: academicPeriodsData } = useQuery(
    useAcademicPeriodsQueryOptions({ page: 1, limit: 100 })
  )
  const { data: studentsData } = useQuery(useStudentsQueryOptions({ page: 1, limit: 500 }))

  const academicPeriodOptions = academicPeriodsData?.data ?? []

  const classOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of teacherClassesData?.data ?? []) {
      map.set(item.class.id, item.class.name)
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [teacherClassesData?.data])

  const studentOptions = useMemo(() => {
    const students = studentsData?.data ?? []
    if (!classId || classId === 'all') return students
    return students.filter((student: any) => student.classId === classId)
  }, [studentsData?.data, classId])

  const { data, isLoading } = useQuery(
    useOccurrencesQueryOptions({
      page,
      limit,
      search: debouncedSearch || undefined,
      type: type && type !== 'all' ? (type as any) : undefined,
      academicPeriodId:
        academicPeriodId && academicPeriodId !== 'all' ? academicPeriodId : undefined,
      classId: classId && classId !== 'all' ? classId : undefined,
      studentId: studentId && studentId !== 'all' ? studentId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      orderBy,
      direction,
    })
  )

  const { data: occurrenceDetail, isLoading: isOccurrenceDetailLoading } = useQuery(
    useOccurrenceDetailQueryOptions(selectedOccurrenceId)
  )

  const rows = data?.data ?? []

  const meta = data?.meta

  const handleSort = (column: 'date' | 'student' | 'class' | 'type') => {
    if (orderBy === column) {
      void setFilters({ direction: direction === 'asc' ? 'desc' : 'asc', page: 1 })
      return
    }

    void setFilters({ orderBy: column, direction: column === 'date' ? 'desc' : 'asc', page: 1 })
  }

  const sortIndicator = (column: 'date' | 'student' | 'class' | 'type') => {
    if (orderBy !== column) return ''
    return direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <EscolaLayout>
      <Head title="Ocorrencias" />

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Ocorrencias
            </h1>
            <p className="text-muted-foreground">Registre e acompanhe ocorrencias pedagogicas</p>
          </div>
          <Button onClick={() => setNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova ocorrencia
          </Button>
        </div>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Buscar por aluno ou descricao"
                  className="pl-9"
                />
              </div>

              <Select
                value={type ?? 'all'}
                onValueChange={(value) => {
                  void setFilters({ type: value === 'all' ? null : value, page: 1 })
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={academicPeriodId ?? 'all'}
                onValueChange={(value) => {
                  void setFilters({
                    academicPeriodId: value === 'all' ? null : value,
                    classId: null,
                    studentId: null,
                    page: 1,
                  })
                }}
              >
                <SelectTrigger className="w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os periodos letivos</SelectItem>
                  {academicPeriodOptions.map((period: any) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={classId ?? 'all'}
                onValueChange={(value) => {
                  void setFilters({
                    classId: value === 'all' ? null : value,
                    studentId: null,
                    page: 1,
                  })
                }}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={studentId ?? 'all'}
                onValueChange={(value) => {
                  void setFilters({ studentId: value === 'all' ? null : value, page: 1 })
                }}
              >
                <SelectTrigger className="w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os alunos</SelectItem>
                  {studentOptions.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.user?.name || student.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate ?? ''}
                onChange={(event) => {
                  void setFilters({ startDate: event.target.value || null, page: 1 })
                }}
                className="w-[170px]"
              />

              <Input
                type="date"
                value={endDate ?? ''}
                onChange={(event) => {
                  void setFilters({ endDate: event.target.value || null, page: 1 })
                }}
                className="w-[170px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de ocorrencias</CardTitle>
            <CardDescription>
              {meta ? `${meta.total} registro${meta.total > 1 ? 's' : ''}` : 'Carregando...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Nenhuma ocorrencia encontrada.
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <button
                            type="button"
                            className="font-medium"
                            onClick={() => handleSort('date')}
                          >
                            Data{sortIndicator('date')}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            type="button"
                            className="font-medium"
                            onClick={() => handleSort('student')}
                          >
                            Aluno{sortIndicator('student')}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            type="button"
                            className="font-medium"
                            onClick={() => handleSort('class')}
                          >
                            Turma{sortIndicator('class')}
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            type="button"
                            className="font-medium"
                            onClick={() => handleSort('type')}
                          >
                            Tipo{sortIndicator('type')}
                          </button>
                        </TableHead>
                        <TableHead>Descricao</TableHead>
                        <TableHead className="text-center">Ciencia</TableHead>
                        <TableHead className="text-right">Detalhe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((occurrence) => (
                        <TableRow
                          key={occurrence.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedOccurrenceId(occurrence.id)}
                        >
                          <TableCell>{brazilianDateFormatter(occurrence.date)}</TableCell>
                          <TableCell className="font-medium">{occurrence.student.name}</TableCell>
                          <TableCell>{occurrence.class.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{typeLabel(occurrence.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[420px] truncate" title={occurrence.text}>
                              {occurrence.text}
                            </p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={occurrence.acknowledgedCount > 0 ? 'default' : 'secondary'}
                            >
                              {occurrence.acknowledgedCount}/{occurrence.totalResponsibles}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedOccurrenceId(occurrence.id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {meta && meta.lastPage > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Pagina {meta.currentPage} de {meta.lastPage}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage <= 1}
                        onClick={() => void setFilters({ page: Math.max(1, meta.currentPage - 1) })}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.currentPage >= meta.lastPage}
                        onClick={() => void setFilters({ page: meta.currentPage + 1 })}
                      >
                        Proxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <NewOccurrenceModal open={newModalOpen} onOpenChange={setNewModalOpen} />

      <Sheet
        open={Boolean(selectedOccurrenceId)}
        onOpenChange={(open) => !open && setSelectedOccurrenceId(null)}
      >
        <SheetContent side="right" className="w-[520px] sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>Detalhe da ocorrencia</SheetTitle>
            <SheetDescription>
              Acompanhamento do registro e ciencia dos responsaveis
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {isOccurrenceDetailLoading || !occurrenceDetail ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Aluno" value={occurrenceDetail.student.name} />
                  <InfoField label="Turma" value={occurrenceDetail.class.name} />
                  <InfoField label="Tipo" value={typeLabel(occurrenceDetail.type)} />
                  <InfoField label="Data" value={brazilianDateFormatter(occurrenceDetail.date)} />
                  <InfoField label="Professor" value={occurrenceDetail.teacher?.name || '-'} />
                  <InfoField label="Materia" value={occurrenceDetail.subject?.name || '-'} />
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Descricao</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{occurrenceDetail.text}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Ciencia dos responsaveis
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold">{occurrenceDetail.acknowledgedCount}</span> de{' '}
                    <span className="font-semibold">{occurrenceDetail.totalResponsibles}</span>{' '}
                    responsavel(is) reconheceram.
                  </p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </EscolaLayout>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}
