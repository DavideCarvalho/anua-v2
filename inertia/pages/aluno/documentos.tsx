import { Head } from '@inertiajs/react'
import { AlunoLayout } from '../../components/layouts/aluno-layout'
import { useAuthUser } from '../../stores/auth_store'
import { StudentDocumentsContainer } from '../../containers/responsavel/student-documents-container'

export default function AlunoDocumentosPage() {
  const user = useAuthUser()
  return (
    <AlunoLayout>
      <Head title="Documentos" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground">Seus documentos de matrícula</p>
        </div>
        {user?.studentId ? (
          <StudentDocumentsContainer studentId={user.studentId} studentName={user.name} />
        ) : (
          <p className="text-muted-foreground">Nenhuma informação disponível.</p>
        )}
      </div>
    </AlunoLayout>
  )
}
