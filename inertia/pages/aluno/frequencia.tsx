import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentAttendanceContainer } from '../../containers/responsavel/student-attendance-container'

export default function AlunoFrequenciaPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Frequência" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frequência</h1>
          <p className="text-muted-foreground">Sua frequência e presenças</p>
        </div>
        {user?.studentId ? (
          <StudentAttendanceContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
