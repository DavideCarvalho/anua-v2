import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { BookOpen, User, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import {
  StudentAssignmentsContainer,
  StudentAssignmentsContainerSkeleton,
} from '../../containers/responsavel/student-assignments-container'

function StudentSelector({
  students,
  selectedId,
  onSelect,
}: {
  students: Array<{ id: string; name: string; className: string }>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {students.map((student) => (
        <Button
          key={student.id}
          variant={selectedId === student.id ? 'default' : 'outline'}
          onClick={() => onSelect(student.id)}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          {student.name}
          <span className="text-xs opacity-70">({student.className})</span>
        </Button>
      ))}
    </div>
  )
}

function AtividadesContent() {
  const { data, isLoading, isError, error } = useQuery(useResponsavelStatsQueryOptions())
  const students = data?.students ?? []
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    students.length > 0 ? students[0].id : null
  )

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  if (isLoading) {
    return <AtividadesSkeleton />
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Ocorreu um erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Voce nao possui alunos vinculados a sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {students.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-medium">Selecione um aluno:</p>
            <StudentSelector
              students={students}
              selectedId={selectedStudentId}
              onSelect={setSelectedStudentId}
            />
          </CardContent>
        </Card>
      )}

      {selectedStudentId && selectedStudent && (
        <StudentAssignmentsContainer
          studentId={selectedStudentId}
          studentName={selectedStudent.name}
        />
      )}
    </div>
  )
}

function AtividadesSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 w-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
      <StudentAssignmentsContainerSkeleton />
    </div>
  )
}

export default function AtividadesPage() {
  return (
    <ResponsavelLayout>
      <Head title="Atividades" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Atividades
          </h1>
          <p className="text-muted-foreground">
            Acompanhe as tarefas e atividades dos seus filhos
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <AtividadesContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
