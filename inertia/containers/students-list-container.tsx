import { Suspense, useMemo, useState } from 'react'
import { useSuspenseQuery, useQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useStudentsQueryOptions } from '../hooks/queries/use_students'
import { useAcademicPeriodsQueryOptions } from '../hooks/queries/use_academic_periods'
import { tuyau } from '../lib/api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  MoreHorizontal,
  Plus,
  Pencil,
  RefreshCw,
  Trash2,
  Filter,
  X,
} from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { DeleteStudentModal } from './students/delete-student-modal'
import { ChangeStudentCourseModal } from './students/change-course-modal'
import { EditPaymentModal } from './students/edit-payment-modal'
import { CreditCard } from 'lucide-react'

interface StudentAction {
  id: string
  name: string
}

// Loading Skeleton
function StudentsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded ml-auto" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error Fallback
function StudentsListError({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Erro ao carregar alunos</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || 'Ocorreu um erro inesperado'}
          </p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

// Content Component
function StudentsListContent({
  search,
  page,
  limit,
  academicPeriodId,
  courseId,
  classId,
  onPageChange,
  onEditStudent,
  onChangeCourse,
  onEditPayment,
  onDeleteStudent,
}: {
  search: string | null
  page: number
  limit: number
  academicPeriodId: string | null
  courseId: string | null
  classId: string | null
  onPageChange: (page: number) => void
  onEditStudent: (student: StudentAction) => void
  onChangeCourse: (student: StudentAction) => void
  onEditPayment: (student: StudentAction) => void
  onDeleteStudent: (student: StudentAction) => void
}) {
  const { data } = useSuspenseQuery(
    useStudentsQueryOptions({
      page,
      limit,
      search: search || undefined,
      academicPeriodId: academicPeriodId || undefined,
      courseId: courseId || undefined,
      classId: classId || undefined,
    })
  )

  const result = data as any
  const students = Array.isArray(result) ? result : result?.data || []
  const meta = !Array.isArray(result) && result?.meta ? result.meta : null

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum aluno encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Tente ajustar os filtros de busca' : 'Cadastre o primeiro aluno'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Nome</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Turma</th>
              <th className="text-right p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => (
              <tr key={student.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {student.user?.name?.charAt(0) || student.name?.charAt(0) || 'A'}
                    </div>
                    <span className="font-medium">{student.user?.name || student.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">
                  {student.user?.email || student.email || '-'}
                </td>
                <td className="p-4">{student.class?.name || '-'}</td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          onEditStudent({
                            id: student.id,
                            name: student.user?.name || student.name,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar aluno
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onChangeCourse({
                            id: student.id,
                            name: student.user?.name || student.name,
                          })
                        }
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Mudar curso
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onEditPayment({
                            id: student.id,
                            name: student.user?.name || student.name,
                          })
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Editar pagamento
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          onDeleteStudent({
                            id: student.id,
                            name: student.user?.name || student.name,
                          })
                        }
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir aluno
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {students.length} de {meta.total} alunos
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {page} de {meta.lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.lastPage}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Types for cascading filter data
interface CourseLevel {
  id: string
  levelId: string
  name: string
  classes: { id: string; name: string }[]
}

interface AcademicPeriodCourse {
  id: string
  courseId: string
  name: string
  levels: CourseLevel[]
}

// Container Export
export function StudentsListContainer() {
  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    academicPeriodId: parseAsString,
    courseId: parseAsString,
    classId: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, academicPeriodId, courseId, classId, page, limit } = filters

  const [deleteStudent, setDeleteStudent] = useState<StudentAction | null>(null)
  const [changeCourseStudent, setChangeCourseStudent] = useState<StudentAction | null>(null)
  const [editPaymentStudent, setEditPaymentStudent] = useState<StudentAction | null>(null)

  // Fetch academic periods
  const { data: academicPeriodsData } = useQuery({
    ...useAcademicPeriodsQueryOptions({ limit: 100 }),
  })
  const academicPeriods = academicPeriodsData?.data ?? []

  // Fetch courses for selected academic period
  const { data: coursesData } = useQuery({
    queryKey: ['academic-period-courses', academicPeriodId],
    queryFn: async () => {
      const response = await tuyau.api.v1['academic-periods']({ id: academicPeriodId! }).courses.$get()
      if (response.error) throw new Error('Erro ao carregar cursos')
      return response.data as AcademicPeriodCourse[]
    },
    enabled: !!academicPeriodId,
  })
  const courses = coursesData ?? []

  // Get classes for selected course (from courses data)
  const classes = useMemo(() => {
    if (!courseId || !courses.length) return []
    const selectedCourse = courses.find((c) => c.courseId === courseId)
    if (!selectedCourse) return []
    // Flatten classes from all levels
    return selectedCourse.levels.flatMap((level) =>
      level.classes.map((cls) => ({
        ...cls,
        levelName: level.name,
      }))
    )
  }, [courseId, courses])

  const hasActiveFilters = search || academicPeriodId || courseId || classId

  const clearFilters = () => {
    setFilters({ search: null, academicPeriodId: null, courseId: null, classId: null, page: 1 })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>
        <Button className="ml-auto" asChild>
          <Link href="/escola/administrativo/matriculas/nova">
            <Plus className="h-4 w-4 mr-2" />
            Novo Aluno
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />

            {/* Academic Period Filter */}
            <Select
              value={academicPeriodId || 'all'}
              onValueChange={(value) =>
                setFilters({
                  academicPeriodId: value === 'all' ? null : value,
                  courseId: null,
                  classId: null,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Período Letivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                {academicPeriods.map((period: any) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course Filter */}
            <Select
              value={courseId || 'all'}
              onValueChange={(value) =>
                setFilters({
                  courseId: value === 'all' ? null : value,
                  classId: null,
                  page: 1,
                })
              }
              disabled={!academicPeriodId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.courseId} value={course.courseId}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            <Select
              value={classId || 'all'}
              onValueChange={(value) =>
                setFilters({ classId: value === 'all' ? null : value, page: 1 })
              }
              disabled={!courseId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({cls.levelName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {deleteStudent && (
        <DeleteStudentModal
          studentId={deleteStudent.id}
          studentName={deleteStudent.name}
          open={!!deleteStudent}
          onOpenChange={(open) => {
            if (!open) setDeleteStudent(null)
          }}
          onSuccess={() => setDeleteStudent(null)}
        />
      )}

      {changeCourseStudent && (
        <ChangeStudentCourseModal
          studentId={changeCourseStudent.id}
          studentName={changeCourseStudent.name}
          open={!!changeCourseStudent}
          onOpenChange={(open) => {
            if (!open) setChangeCourseStudent(null)
          }}
          onSuccess={() => setChangeCourseStudent(null)}
        />
      )}

      {editPaymentStudent && (
        <EditPaymentModal
          studentId={editPaymentStudent.id}
          studentName={editPaymentStudent.name}
          open={!!editPaymentStudent}
          onOpenChange={(open) => {
            if (!open) setEditPaymentStudent(null)
          }}
          onSuccess={() => setEditPaymentStudent(null)}
        />
      )}

      {/* List */}
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <StudentsListError error={error as Error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<StudentsListSkeleton />}>
              <StudentsListContent
                search={search}
                page={page}
                limit={limit}
                academicPeriodId={academicPeriodId}
                courseId={courseId}
                classId={classId}
                onPageChange={(p) => setFilters({ page: p })}
                onEditStudent={(student) =>
                  router.visit(`/escola/administrativo/alunos/${student.id}/editar`)
                }
                onChangeCourse={setChangeCourseStudent}
                onEditPayment={setEditPaymentStudent}
                onDeleteStudent={setDeleteStudent}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
