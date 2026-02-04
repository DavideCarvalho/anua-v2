import { Head } from '@inertiajs/react'
import { EscolaLayout } from '~/components/layouts'
import { EditStudentPage } from '~/containers/edit-student/edit-student-page'

export default function EditarAlunoPage({ studentId }: { studentId: string }) {
  return (
    <EscolaLayout>
      <Head title="Editar Aluno" />
      <EditStudentPage studentId={studentId} />
    </EscolaLayout>
  )
}
