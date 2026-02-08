import { Head } from '@inertiajs/react'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { DollarSign, User, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { StudentSelectorWithData } from '../../components/responsavel/student-selector'
import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentPaymentsContainer,
  StudentPaymentsContainerSkeleton,
} from '../../containers/responsavel/student-payments-container'

function MensalidadesContent() {
  const { student, studentId, students, isLoaded, setDefaultStudent } = useSelectedStudent()

  useEffect(() => {
    setDefaultStudent()
  }, [setDefaultStudent])

  if (!isLoaded) {
    return <MensalidadesSkeleton />
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
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
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <StudentSelectorWithData />
            </div>
          </CardContent>
        </Card>
      )}

      {studentId && student && <StudentPaymentsContainer studentId={studentId} />}
    </div>
  )
}

function MensalidadesSkeleton() {
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
      <StudentPaymentsContainerSkeleton />
    </div>
  )
}

export default function MensalidadesPage() {
  return (
    <ResponsavelLayout>
      <Head title="Mensalidades" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Mensalidades
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os pagamentos e mensalidades dos seus filhos
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
          <MensalidadesContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
