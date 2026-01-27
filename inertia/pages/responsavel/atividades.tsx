import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { BookOpen, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentAssignmentsContainer,
  StudentAssignmentsContainerSkeleton,
} from '../../containers/responsavel/student-assignments-container'

function NoStudentCard() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno selecionado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um aluno no menu acima para ver as atividades
        </p>
      </CardContent>
    </Card>
  )
}

function AtividadesContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <AtividadesSkeleton />
  }

  if (!student) {
    return <NoStudentCard />
  }

  return (
    <StudentAssignmentsContainer
      studentId={student.id}
      studentName={student.name}
    />
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
