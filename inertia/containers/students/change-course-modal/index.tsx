import { useEffect, useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { useStudentQueryOptions, type StudentResponse } from '~/hooks/queries/use_student'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'
import { useUpdateStudent } from '~/hooks/mutations/use_student_mutations'
import { getCourseLabels, getLevelLabels, type AcademicPeriodSegment } from '~/lib/formatters'

const schema = z.object({
  academicPeriodId: z.string().min(1, 'Selecione o período letivo'),
  courseId: z.string().min(1, 'Selecione o curso'),
  levelId: z.string().min(1, 'Selecione o nível'),
  classId: z.string().min(1, 'Selecione a turma'),
})

type FormData = z.infer<typeof schema>

// Types for nested student data
interface CourseHasAcademicPeriod {
  academicPeriodId: string
  courseId: string
}

interface LevelAssignedToCourseAcademicPeriod {
  levelId: string
  courseHasAcademicPeriod?: CourseHasAcademicPeriod
}

interface StudentLevel {
  classId: string | null
  academicPeriodId?: string | null
  levelId?: string | null
  class?: StudentClass
  levelAssignedToCourseAcademicPeriod?: LevelAssignedToCourseAcademicPeriod
}

function getEnrollmentAcademicPeriodId(level: StudentLevel) {
  return (
    level.levelAssignedToCourseAcademicPeriod?.courseHasAcademicPeriod?.academicPeriodId ||
    level.academicPeriodId ||
    ''
  )
}

interface StudentClass {
  id: string
  name: string
  levelId?: string | null
}

type StudentData = StudentResponse & {
  class?: StudentClass
  levels?: StudentLevel[]
}

interface ChangeStudentCourseModalProps {
  studentId: string
  studentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CurrentEnrollment {
  academicPeriodId: string
  courseId: string
  levelId: string
  classId: string
}

interface InitState {
  academicPeriodSet: boolean
  courseSet: boolean
  levelSet: boolean
  classSet: boolean
}

export function ChangeStudentCourseModal({
  studentId,
  studentName,
  open,
  onOpenChange,
  onSuccess,
}: ChangeStudentCourseModalProps) {
  // Track previous open state to detect transitions
  const prevOpenRef = useRef(false)
  const prevStudentIdRef = useRef(studentId)
  const prevActivePeriodIdRef = useRef('')

  const [activePeriodId, setActivePeriodId] = useState('')

  // Track initialization state for cascading form fields
  const [initState, setInitState] = useState<InitState>({
    academicPeriodSet: false,
    courseSet: false,
    levelSet: false,
    classSet: false,
  })

  const { data: student, isLoading: isLoadingStudent } = useQuery({
    ...useStudentQueryOptions(studentId),
    enabled: open && !!studentId,
    staleTime: 0, // Always refetch when modal opens
  })

  const updateStudent = useUpdateStudent()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      academicPeriodId: '',
      courseId: '',
      levelId: '',
      classId: '',
    },
  })

  const academicPeriodId = form.watch('academicPeriodId')
  const courseId = form.watch('courseId')
  const levelId = form.watch('levelId')

  const { data: academicPeriodsData, isLoading: isLoadingPeriods } = useQuery(
    useAcademicPeriodsQueryOptions({ limit: 50, isActive: true })
  )

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    ...useAcademicPeriodCoursesQueryOptions(academicPeriodId),
    enabled: !!academicPeriodId,
  })

  const academicPeriods = academicPeriodsData?.data ?? []
  const courses = coursesData ?? []
  const selectedCourse = courses.find((c) => c.courseId === courseId)
  const levels = selectedCourse?.levels ?? []
  const selectedLevel = levels.find((l) => l.levelId === levelId)
  const classes = useMemo(() => {
    const levelClasses =
      (selectedLevel as { classes?: Array<{ id: string; name: string }> } | undefined)?.classes ??
      []

    const uniqueById = new Map(levelClasses.map((cls) => [cls.id, cls]))
    return Array.from(uniqueById.values())
  }, [selectedLevel])

  // Get segment from selected academic period for dynamic labels
  const selectedPeriod = academicPeriods.find((p) => p.id === academicPeriodId)
  const segment = (selectedPeriod?.segment as AcademicPeriodSegment) || 'ELEMENTARY'
  const courseLabels = getCourseLabels(segment)
  const levelLabels = getLevelLabels(segment)

  const studentData = student as StudentData | undefined

  const enrollmentPeriods = useMemo(() => {
    if (!studentData?.levels?.length) return []

    const uniquePeriodIds = Array.from(
      new Set(studentData.levels.map((l) => getEnrollmentAcademicPeriodId(l)).filter(Boolean))
    ) as string[]

    if (uniquePeriodIds.length === 0) return []

    return uniquePeriodIds
      .map((id) => {
        const period = academicPeriods.find((p) => p.id === id && p.isActive)
        return {
          id,
          name: period?.name ?? 'Período letivo',
          startDate: period?.startDate ? new Date(String(period.startDate)) : null,
        }
      })
      .filter(
        (period) => period.startDate !== null || academicPeriods.some((p) => p.id === period.id)
      )
      .sort((a, b) => {
        if (!a.startDate && !b.startDate) return 0
        if (!a.startDate) return 1
        if (!b.startDate) return -1
        return b.startDate.getTime() - a.startDate.getTime()
      })
  }, [studentData?.levels, academicPeriods])

  useEffect(() => {
    if (!open) {
      setActivePeriodId('')
      return
    }

    if (!activePeriodId && enrollmentPeriods.length > 0) {
      setActivePeriodId(enrollmentPeriods[0].id)
    }
  }, [open, activePeriodId, enrollmentPeriods])

  // Step 1: Extract current enrollment data from student
  // Use the student's current classId as the source of truth
  const currentEnrollment = useMemo<CurrentEnrollment | null>(() => {
    if (!student || !open) return null

    const studentData = student as StudentData

    const periodEnrollment = activePeriodId
      ? studentData.levels?.find((l) => getEnrollmentAcademicPeriodId(l) === activePeriodId)
      : undefined

    // Use current classId from student, not from levels array which may have old data
    const currentClassId = periodEnrollment?.classId || studentData.classId || studentData.class?.id
    const currentLevelId = periodEnrollment?.class?.levelId || studentData.class?.levelId

    // Find enrollment that matches current class, or use the first one as fallback for period/course info
    const matchingEnrollment = studentData.levels?.find(
      (l) =>
        l.classId === currentClassId &&
        (!activePeriodId || getEnrollmentAcademicPeriodId(l) === activePeriodId)
    )
    const fallbackEnrollment = studentData.levels?.[0]
    const enrollment = matchingEnrollment || periodEnrollment || fallbackEnrollment

    if (!currentClassId) return null

    const lacap = enrollment?.levelAssignedToCourseAcademicPeriod
    const chap = lacap?.courseHasAcademicPeriod
    const enrollmentAcademicPeriodId = enrollment ? getEnrollmentAcademicPeriodId(enrollment) : ''

    return {
      academicPeriodId:
        activePeriodId || chap?.academicPeriodId || enrollmentAcademicPeriodId || '',
      courseId: chap?.courseId || '',
      levelId: currentLevelId || lacap?.levelId || enrollment?.levelId || '',
      classId: currentClassId,
    }
  }, [student, open, activePeriodId])

  // Step 2: Set academic period when enrollment data is available
  useEffect(() => {
    if (currentEnrollment && !initState.academicPeriodSet && academicPeriods.length > 0) {
      const exists = academicPeriods.some((p) => p.id === currentEnrollment.academicPeriodId)
      if (exists) {
        form.setValue('academicPeriodId', currentEnrollment.academicPeriodId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        })
        setInitState((prev) => ({ ...prev, academicPeriodSet: true }))
      }
    }
  }, [currentEnrollment, initState.academicPeriodSet, academicPeriods, form])

  // Step 3: Set course when courses are loaded
  useEffect(() => {
    if (
      currentEnrollment &&
      initState.academicPeriodSet &&
      !initState.courseSet &&
      courses.length > 0
    ) {
      // Use courseId directly from enrollment if available, otherwise find by level
      const exists = courses.some((c) => c.courseId === currentEnrollment.courseId)
      if (exists && currentEnrollment.courseId) {
        form.setValue('courseId', currentEnrollment.courseId)
        setInitState((prev) => ({ ...prev, courseSet: true }))
      } else {
        // Fallback: find course that contains the student's current level
        const course = courses.find((c) =>
          c.levels?.some((l) => l.levelId === currentEnrollment.levelId)
        )
        if (course) {
          form.setValue('courseId', course.courseId)
          setInitState((prev) => ({ ...prev, courseSet: true }))
        }
      }
    }
  }, [currentEnrollment, initState.academicPeriodSet, initState.courseSet, courses, form])

  // Step 4: Set level when course is set
  useEffect(() => {
    if (currentEnrollment && initState.courseSet && !initState.levelSet && levels.length > 0) {
      const exists = levels.some((l) => l.levelId === currentEnrollment.levelId)
      if (exists) {
        form.setValue('levelId', currentEnrollment.levelId)
        setInitState((prev) => ({ ...prev, levelSet: true }))
      }
    }
  }, [currentEnrollment, initState.courseSet, initState.levelSet, levels, form])

  // Step 5: Set class when classes are loaded
  useEffect(() => {
    if (currentEnrollment && initState.levelSet && !initState.classSet && classes.length > 0) {
      const exists = classes.some((c) => c.id === currentEnrollment.classId)
      if (exists) {
        form.setValue('classId', currentEnrollment.classId)
        setInitState((prev) => ({ ...prev, classSet: true }))
      }
    }
  }, [currentEnrollment, initState.levelSet, initState.classSet, classes, form])

  // Reset when modal opens (transition from closed to open) or studentId changes
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current
    const studentChanged = studentId !== prevStudentIdRef.current
    const activePeriodChanged = open && activePeriodId !== prevActivePeriodIdRef.current

    if (justOpened || studentChanged || activePeriodChanged) {
      setInitState({
        academicPeriodSet: false,
        courseSet: false,
        levelSet: false,
        classSet: false,
      })
      form.reset()
    }

    // Update refs
    prevOpenRef.current = open
    prevStudentIdRef.current = studentId
    prevActivePeriodIdRef.current = activePeriodId
  }, [open, form, studentId, activePeriodId])

  async function handleSubmit(data: FormData) {
    try {
      await updateStudent.mutateAsync({
        id: studentId,
        classId: data.classId,
        academicPeriodId: data.academicPeriodId,
        courseId: data.courseId,
        levelId: data.levelId,
      })

      toast.success('Turma alterada com sucesso!')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error changing class:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar turma'
      toast.error(errorMessage)
    }
  }

  function handleClose() {
    form.reset()
    setInitState({
      academicPeriodSet: false,
      courseSet: false,
      levelSet: false,
      classSet: false,
    })
    onOpenChange(false)
  }

  // Get class from the most recent StudentHasLevel that has a class
  const currentStudentLevel = studentData?.levels?.find((l) => l.classId && l.class)
  const selectedStudentLevel = activePeriodId
    ? studentData?.levels?.find(
        (l) => getEnrollmentAcademicPeriodId(l) === activePeriodId && l.class
      )
    : undefined
  const currentClass =
    selectedStudentLevel?.class ?? currentStudentLevel?.class ?? studentData?.class

  if (isLoadingStudent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Alterar Turma</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando dados do aluno...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Turma</DialogTitle>
        </DialogHeader>

        {/* Student Info Card */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {studentName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{studentName}</h3>
              <Badge variant="default" className="shrink-0">
                {studentData?.enrollmentStatus === 'REGISTERED' ? 'Matriculado' : 'Pendente'}
              </Badge>
            </div>
            {currentClass && (
              <p className="text-sm text-muted-foreground truncate">
                <span className="font-medium">Turma atual:</span> {currentClass.name}
              </p>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {enrollmentPeriods.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Período da Matrícula</p>
                <Tabs value={activePeriodId} onValueChange={setActivePeriodId} className="w-full">
                  <TabsList className="w-full justify-start">
                    {enrollmentPeriods.map((period) => (
                      <TabsTrigger key={period.id} value={period.id}>
                        {period.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            <FormField
              control={form.control}
              name="academicPeriodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período Letivo</FormLabel>
                  <Select
                    key={`period-${field.value}`}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('courseId', '')
                      form.setValue('levelId', '')
                      form.setValue('classId', '')
                    }}
                    value={field.value}
                    disabled={isLoadingPeriods || enrollmentPeriods.length > 1}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingPeriods ? 'Carregando...' : 'Selecione o período letivo'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicPeriods.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{courseLabels.singular}</FormLabel>
                  <Select
                    key={`course-${field.value}`}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('levelId', '')
                      form.setValue('classId', '')
                    }}
                    value={field.value}
                    disabled={!academicPeriodId || isLoadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !academicPeriodId
                              ? 'Selecione o período primeiro'
                              : isLoadingCourses
                                ? 'Carregando...'
                                : `Selecione ${courseLabels.definite.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.courseId} value={course.courseId}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="levelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{levelLabels.singular}</FormLabel>
                  <Select
                    key={`level-${field.value}`}
                    onValueChange={(value) => {
                      field.onChange(value)
                      form.setValue('classId', '')
                    }}
                    value={field.value}
                    disabled={!courseId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !courseId
                              ? `Selecione ${courseLabels.definite.toLowerCase()} primeiro`
                              : `Selecione ${levelLabels.definite.toLowerCase()}`
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.levelId} value={level.levelId}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Turma</FormLabel>
                  <Select
                    key={`class-${field.value}`}
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!levelId || isLoadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !levelId
                              ? `Selecione ${levelLabels.definite.toLowerCase()} primeiro`
                              : isLoadingCourses
                                ? 'Carregando...'
                                : 'Selecione a turma'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
