import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentCalendarContainer } from '../../containers/responsavel/student-calendar-container'

export default function AlunoCalendarioPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Calendário" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">Seu calendário escolar</p>
        </div>
        {user?.studentId ? (
          <StudentCalendarContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
