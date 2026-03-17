import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { CalendarDays, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentCalendarContainer,
  StudentCalendarContainerSkeleton,
} from '../../containers/responsavel/student-calendar-container'

function NoStudentCard() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno selecionado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um aluno no menu acima para ver o calendario.
        </p>
      </CardContent>
    </Card>
  )
}

function CalendarioContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentCalendarContainerSkeleton />
  }

  if (!student) {
    return <NoStudentCard />
  }

  return <StudentCalendarContainer studentId={student.id} studentName={student.name} />
}

export default function CalendarioPage() {
  return (
    <ResponsavelLayout>
      <Head title="Calendário" />

      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <CalendarDays className="h-6 w-6" />
            Calendário
          </h1>
          <p className="text-muted-foreground">
            Visualize atividades, provas e eventos do aluno selecionado.
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
          <CalendarioContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
