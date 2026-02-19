import { Head } from '@inertiajs/react'
import { Calendar } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'

import { useSelectedStudent } from '../../hooks/use_selected_student'
import {
  StudentAttendanceContainer,
  StudentAttendanceContainerSkeleton,
} from '../../containers/responsavel/student-attendance-container'

function FrequenciaContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentAttendanceContainerSkeleton />
  }

  if (!student) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Você não possui alunos vinculados à sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <StudentAttendanceContainer studentId={student.id} studentName={student.name} />
}

export default function FrequenciaPage() {
  return (
    <ResponsavelLayout>
      <Head title="Frequencia" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Frequencia
          </h1>
          <p className="text-muted-foreground">Acompanhe a frequencia escolar dos seus filhos</p>
        </div>

        <FrequenciaContent />
      </div>
    </ResponsavelLayout>
  )
}
