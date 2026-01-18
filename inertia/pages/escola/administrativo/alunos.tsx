import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { StudentsListContainer } from '../../../containers/students-list-container'

export default function AlunosPage() {
  return (
    <EscolaLayout>
      <Head title="Alunos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie os alunos matriculados na escola
          </p>
        </div>

        <StudentsListContainer />
      </div>
    </EscolaLayout>
  )
}
