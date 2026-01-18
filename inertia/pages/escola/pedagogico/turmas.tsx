import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { ClassesListContainer } from '../../../containers/classes-list-container'

export default function TurmasPage() {
  return (
    <EscolaLayout>
      <Head title="Turmas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie as turmas e suas configurações
          </p>
        </div>

        <ClassesListContainer />
      </div>
    </EscolaLayout>
  )
}
