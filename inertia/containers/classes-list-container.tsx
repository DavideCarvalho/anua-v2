import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import {
  useQuery,
  useQueryClient,
  useMutation,
  QueryErrorResetBoundary,
} from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { useClassesQueryOptions } from '../hooks/queries/use_classes'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
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
import { EditClassModal } from './classes/edit-class-modal'
import { CreateClassModal } from './classes/create-class-modal'
import { tuyau } from '../lib/api'
import type { SharedProps } from '../lib/types'

interface ClassItem {
  id: string
  name: string
  slug: string
  level?: {
    name: string
    course?: {
      name: string
    }
  }
  studentsCount?: number
  active?: boolean
  teacherClasses?: Array<{
    id: string
    teacherId: string
    subjectId: string
    subjectQuantity: number
    teacher?: { id: string; user?: { name: string } }
    subject?: { id: string; name: string }
  }>
}

// Loading Skeleton
function ClassesListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded mb-4" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Error Fallback
function ClassesListErrorFallback({
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
          <h3 className="font-semibold text-destructive">Erro ao carregar turmas</h3>
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

// Container Export
export function ClassesListContainer() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ClassesListErrorFallback
              error={error as Error}
              resetErrorBoundary={resetErrorBoundary}
            />
          )}
        >
          <ClassesListContent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function ClassesListContent() {
  const queryClient = useQueryClient()
  const { props } = usePage<SharedProps>()
  const isSchoolTeacher = props.user?.role?.name === 'SCHOOL_TEACHER'

  // URL state with nuqs
  const [filters, setFilters] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(20),
  })

  const { search, page, limit } = filters

  const { data, isLoading, error, refetch } = useQuery(
    useClassesQueryOptions({ page, limit, search: search || undefined })
  )

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null)
  const [_isLoadingClassDetails, setIsLoadingClassDetails] = useState(false)

  const { mutateAsync: deleteClass, isPending: isDeleting } = useMutation({
    mutationFn: async (classId: string) => {
      const response = await (tuyau.api.v1.classes as any)({ id: classId }).$delete()
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao excluir turma')
      }
      return response
    },
  })

  const handleEditClass = async (classItem: ClassItem) => {
    setIsLoadingClassDetails(true)
    try {
      const classData = await (tuyau.api.v1.classes as any)({ id: classItem.id }).$get().unwrap()
      setSelectedClass({
        ...classItem,
        ...classData,
      })
      setEditModalOpen(true)
    } catch (error) {
      console.error('Error fetching class details:', error)
      setSelectedClass(classItem)
      setEditModalOpen(true)
    } finally {
      setIsLoadingClassDetails(false)
    }
  }

  const handleDeleteClass = (classItem: ClassItem) => {
    setClassToDelete(classItem)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!classToDelete) return
    try {
      await deleteClass(classToDelete.id)
      toast.success('Turma excluída com sucesso')
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      setDeleteDialogOpen(false)
      setClassToDelete(null)
    } catch (error) {
      toast.error('Erro ao excluir turma')
    }
  }

  const classes: ClassItem[] = (data?.data || []) as any
  const meta = data?.meta ?? null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar turmas..."
            className="pl-9"
            value={search || ''}
            onChange={(e) => setFilters({ search: e.target.value || null, page: 1 })}
          />
        </div>
        {!isSchoolTeacher && (
          <Button className="ml-auto" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        )}
      </div>

      {isLoading && <ClassesListSkeleton />}

      {error && <ClassesListErrorFallback error={error} resetErrorBoundary={() => refetch()} />}

      {!isLoading && !error && classes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma turma encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">Cadastre a primeira turma</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && classes.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {classItem.level?.name || 'Sem série'} -{' '}
                        {classItem.level?.course?.name || ''}
                      </p>
                    </div>
                    {!isSchoolTeacher && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClass(classItem)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar turma
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClass(classItem)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir turma
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{classItem.studentsCount || 0} alunos</span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        classItem.active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {classItem.active !== false ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {meta && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {classes.length} de {meta.total} turmas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setFilters({ page: page - 1 })}
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
                  onClick={() => setFilters({ page: page + 1 })}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <EditClassModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        classData={selectedClass}
      />

      {!isSchoolTeacher && (
        <CreateClassModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir turma</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a turma "{classToDelete?.name}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
