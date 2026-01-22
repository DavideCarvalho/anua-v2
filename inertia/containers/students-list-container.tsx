import { Suspense, useState } from 'react'
import { useSuspenseQuery, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useStudentsQueryOptions } from '../hooks/queries/use-students'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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
} from 'lucide-react'
import { NewStudentModal } from './students/new-student-modal'
import { DeleteStudentModal } from './students/delete-student-modal'
import { EditStudentModal } from './students/edit-student-modal'
import { ChangeStudentCourseModal } from './students/change-course-modal'

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
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
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
  onPageChange,
  onEditStudent,
  onChangeCourse,
  onDeleteStudent,
}: {
  search: string
  page: number
  onPageChange: (page: number) => void
  onEditStudent: (student: StudentAction) => void
  onChangeCourse: (student: StudentAction) => void
  onDeleteStudent: (student: StudentAction) => void
}) {
  const { data } = useSuspenseQuery(
    useStudentsQueryOptions({ page, limit: 20, search: search || undefined })
  )

  const students = Array.isArray(data) ? data : data?.data || []
  const meta = !Array.isArray(data) && data?.meta ? data.meta : null

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
              <th className="text-left p-4 font-medium">Status</th>
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
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      student.user?.active || student.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {student.user?.active || student.active ? 'Ativo' : 'Inativo'}
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

// Container Export
export function StudentsListContainer() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false)
  const [deleteStudent, setDeleteStudent] = useState<StudentAction | null>(null)
  const [editStudent, setEditStudent] = useState<StudentAction | null>(null)
  const [changeCourseStudent, setChangeCourseStudent] = useState<StudentAction | null>(null)

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Buscar
        </Button>
        <Button className="ml-auto" onClick={() => setIsNewStudentModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      <NewStudentModal
        open={isNewStudentModalOpen}
        onOpenChange={setIsNewStudentModalOpen}
      />

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

      {editStudent && (
        <EditStudentModal
          studentId={editStudent.id}
          open={!!editStudent}
          onOpenChange={(open) => {
            if (!open) setEditStudent(null)
          }}
          onSuccess={() => setEditStudent(null)}
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

      {/* List */}
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={({ error, resetErrorBoundary }) => (
              <StudentsListError error={error} resetErrorBoundary={resetErrorBoundary} />
            )}
          >
            <Suspense fallback={<StudentsListSkeleton />}>
              <StudentsListContent
                search={search}
                page={page}
                onPageChange={setPage}
                onEditStudent={setEditStudent}
                onChangeCourse={setChangeCourseStudent}
                onDeleteStudent={setDeleteStudent}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
