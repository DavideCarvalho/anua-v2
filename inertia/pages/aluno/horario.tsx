import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentScheduleContainer } from '../../containers/responsavel/student-schedule-container'

export default function AlunoHorarioPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Horário" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horário</h1>
          <p className="text-muted-foreground">Seu horário de aulas</p>
        </div>
        {user?.studentId ? (
          <StudentScheduleContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
