import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { EmployeesListContainer } from '../../../containers/employees-list-container'

export default function FuncionariosPage() {
  return (
    <EscolaLayout>
      <Head title="Funcionários" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie os funcionários da escola
          </p>
        </div>

        <EmployeesListContainer />
      </div>
    </EscolaLayout>
  )
}
