import { Head } from '@inertiajs/react'
import { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { UtensilsCrossed, XCircle, User } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import { StudentSelectorWithData } from '../../components/responsavel/student-selector'
import {
  StudentBalanceContainer,
  StudentBalanceContainerSkeleton,
} from '../../containers/responsavel/student-balance-container'
import { StudentCanteenPurchasesContainer } from '../../containers/responsavel/student-canteen-purchases-container'

function CantinaContent() {
  const { student, studentId, students, isLoaded, setDefaultStudent } = useSelectedStudent()

  useEffect(() => {
    setDefaultStudent()
  }, [setDefaultStudent])

  if (!isLoaded) {
    return (
      <>
        <div className="hidden" aria-hidden>
          <StudentSelectorWithData />
        </div>
        <StudentBalanceContainerSkeleton />
      </>
    )
  }

  if (students.length === 0 || !student) {
    return (
      <>
        <div className="hidden" aria-hidden>
          <StudentSelectorWithData />
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Você não possui alunos vinculados à sua conta.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data loader: populate responsavel store even with single student */}
      <div className="hidden" aria-hidden>
        <StudentSelectorWithData />
      </div>

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

      <StudentBalanceContainer studentId={student.id} studentName={student.name} />
      {studentId && <StudentCanteenPurchasesContainer studentId={studentId} />}
    </div>
  )
}

export default function CantinaPage() {
  return (
    <ResponsavelLayout>
      <Head title="Cantina" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6" />
            Cantina
          </h1>
          <p className="text-muted-foreground">Acompanhe o saldo e as compras na cantina</p>
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
          <CantinaContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
