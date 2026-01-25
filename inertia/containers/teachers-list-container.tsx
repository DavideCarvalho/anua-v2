import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary, useMutation, useQueryClient } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { usePage } from '@inertiajs/react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useTeachersQueryOptions } from '../hooks/queries/use_teachers'
import { useUpdateTeacherMutationOptions } from '../hooks/mutations/use_teacher_mutations'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Edit,
  DollarSign,
  BookOpen,
  UserX,
  UserCheck,
  X,
} from 'lucide-react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { NewTeacherModal } from './teachers/new-teacher-modal'
import { EditTeacherDataModal } from './teachers/edit-teacher-data-modal'
import { EditTeacherRateModal } from './teachers/edit-teacher-rate-modal'
import { EditTeacherSubjectsModal } from './teachers/edit-teacher-subjects-modal'
import type { SharedProps } from '../lib/types'

// Loading Skeleton
function TeachersListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded ml-auto" />
      </div>
      <div className="border rounded-lg">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-0">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
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
function TeachersListError({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar professores</h3>
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

interface TeacherItem {
  id: string
  hourlyRate?: number
  user?: {
    id: string
    name: string
    email: string
    active: boolean
  }
  subjects?: Array<{ id: string; name: string }>
}

// Content Component
function TeachersListContent({
  search,
  status,
  page,
  limit,
  onPageChange,
  onEditData,
  onEditRate,
  onEditSubjects,
  onToggleActive,
}: {
  search: string | null
  status: string | null
  page: number
  limit: number
  onPageChange: (page: number) => void
  onEditData: (teacher: TeacherItem) => void
  onEditRate: (teacher: TeacherItem) => void
  onEditSubjects: (teacher: TeacherItem) => void
  onToggleActive: (teacher: TeacherItem) => void
}) {
  // Convert status to active boolean
  const active = status === 'all' ? undefined : status === 'inactive' ? false : true

  const { data } = useSuspenseQuery(
    useTeachersQueryOptions({ page, limit, search: search || undefined, active })
  )

  const teachers = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

  if (teachers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Nenhum professor encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Tente ajustar os filtros de busca' : 'Cadastre o primeiro professor'}
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
              <th className="text-left p-4 font-medium">Disciplinas</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-right p-4 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher: any) => (
              <tr key={teacher.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                      {teacher.user?.name?.charAt(0) || teacher.name?.charAt(0) || 'P'}
                    </div>
                    <span className="font-medium">{teacher.user?.name || teacher.name}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">
                  {teacher.user?.email || teacher.email || '-'}
                </td>
                <td className="p-4">
                  {teacher.subjects?.length > 0
                    ? teacher.subjects.map((s: any) => s.name).join(', ')
                    : '-'}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      teacher.user?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {teacher.user?.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditData(teacher)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar dados
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditRate(teacher)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Editar valor hora/aula
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditSubjects(teacher)}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Editar disciplinas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleActive(teacher)}
                        className={teacher.user?.active ? 'text-destructive focus:text-destructive' : ''}
                      >
                        {teacher.user?.active ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Desativar professor
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Ativar professor
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {teachers.length} de {meta.total} professores
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

// Container Export
export function TeachersListContainer() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    status: parseAsString.withDefault('active'),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, status, page, limit } = filters
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Edit modals state
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null)
  const [isEditDataModalOpen, setIsEditDataModalOpen] = useState(false)
  const [isEditRateModalOpen, setIsEditRateModalOpen] = useState(false)
  const [isEditSubjectsModalOpen, setIsEditSubjectsModalOpen] = useState(false)
  const [isToggleActiveModalOpen, setIsToggleActiveModalOpen] = useState(false)
  const [teacherToToggle, setTeacherToToggle] = useState<TeacherItem | null>(null)

  const hasActiveFilters = search || status !== 'active'

  const clearFilters = () => {
    setFilters({ search: null, status: 'active', page: 1 })
  }

  const handleEditData = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher)
    setIsEditDataModalOpen(true)
  }

  const handleEditRate = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher)
    setIsEditRateModalOpen(true)
  }

  const handleEditSubjects = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher)
    setIsEditSubjectsModalOpen(true)
  }

  const queryClient = useQueryClient()
  const updateTeacher = useMutation(useUpdateTeacherMutationOptions())

  const handleToggleActive = (teacher: TeacherItem) => {
    setTeacherToToggle(teacher)
    setIsToggleActiveModalOpen(true)
  }

  const confirmToggleActive = async () => {
    if (!teacherToToggle) return
    try {
      await updateTeacher.mutateAsync({
        id: teacherToToggle.id,
        active: !teacherToToggle.user?.active,
      })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    } catch (error) {
      console.error('Error toggling teacher active status:', error)
    } finally {
      setIsToggleActiveModalOpen(false)
      setTeacherToToggle(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar professores..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => setFilters({ status: value, page: 1 })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}

        <Button className="ml-auto" onClick={() => setIsNewModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Professor
        </Button>
      </div>

      {schoolId && (
        <NewTeacherModal
          schoolId={schoolId}
          open={isNewModalOpen}
          onOpenChange={setIsNewModalOpen}
        />
      )}

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <TeachersListError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<TeachersListSkeleton />}>
              <TeachersListContent
                search={search}
                status={status}
                page={page}
                limit={limit}
                onPageChange={(p) => setFilters({ page: p })}
                onEditData={handleEditData}
                onEditRate={handleEditRate}
                onEditSubjects={handleEditSubjects}
                onToggleActive={handleToggleActive}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>

      <EditTeacherDataModal
        open={isEditDataModalOpen}
        onOpenChange={setIsEditDataModalOpen}
        teacher={selectedTeacher}
      />

      <EditTeacherRateModal
        open={isEditRateModalOpen}
        onOpenChange={setIsEditRateModalOpen}
        teacher={selectedTeacher}
      />

      {schoolId && (
        <EditTeacherSubjectsModal
          open={isEditSubjectsModalOpen}
          onOpenChange={setIsEditSubjectsModalOpen}
          teacher={selectedTeacher}
          schoolId={schoolId}
        />
      )}

      <AlertDialog open={isToggleActiveModalOpen} onOpenChange={setIsToggleActiveModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {teacherToToggle?.user?.active ? 'Desativar professor' : 'Ativar professor'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {teacherToToggle?.user?.active
                ? `Tem certeza que deseja desativar o professor "${teacherToToggle?.user?.name}"? Ele não poderá mais acessar o sistema.`
                : `Tem certeza que deseja ativar o professor "${teacherToToggle?.user?.name}"? Ele poderá acessar o sistema novamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleActive}
              className={teacherToToggle?.user?.active ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {updateTeacher.isPending
                ? 'Processando...'
                : teacherToToggle?.user?.active
                  ? 'Desativar'
                  : 'Ativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
