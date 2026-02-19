import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { FileText, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentDocumentsContainer,
  StudentDocumentsContainerSkeleton,
} from '../../containers/responsavel/student-documents-container'

function DocumentosContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentDocumentsContainerSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não possui alunos vinculados à sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <StudentDocumentsContainer studentId={student.id} studentName={student.name} />
}

export default function DocumentosPage() {
  return (
    <ResponsavelLayout>
      <Head title="Documentos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documentos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os documentos enviados e pendentes dos seus filhos
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
          <DocumentosContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
