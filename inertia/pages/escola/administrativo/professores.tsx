import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { TeachersListContainer } from '../../../containers/teachers-list-container'

export default function ProfessoresPage() {
  return (
    <EscolaLayout>
      <Head title="Professores" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Professores</h1>
          <p className="text-muted-foreground">
            Gerencie o corpo docente da escola
          </p>
        </div>

        <TeachersListContainer />
      </div>
    </EscolaLayout>
  )
}
