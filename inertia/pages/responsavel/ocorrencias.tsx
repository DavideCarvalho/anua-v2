import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentOccurrencesContainer,
  StudentOccurrencesContainerSkeleton,
} from '../../containers/responsavel/student-occurrences-container'

function OcorrenciasContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentOccurrencesContainerSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Voce nao possui alunos vinculados a sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <StudentOccurrencesContainer
      studentId={student.id}
      studentName={student.name}
    />
  )
}

export default function OcorrenciasPage() {
  return (
    <ResponsavelLayout>
      <Head title="Ocorrencias" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            Ocorrencias
          </h1>
          <p className="text-muted-foreground">
            Acompanhe as ocorrencias registradas para seus filhos
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
          <OcorrenciasContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
