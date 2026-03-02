import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ArrowLeft } from 'lucide-react'

import { EscolaLayout } from '../../../../components/layouts'
import { Button } from '../../../../components/ui/button'
import { ContractForm } from '../../../../containers/contracts/contract-form'
import { useAuthUser } from '../../../../stores/auth_store'

export default function NovoContratoPage() {
  const user = useAuthUser()
  const schoolId = user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Novo Contrato" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.administrativo.contratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Contrato</h1>
            <p className="text-muted-foreground">Configure um novo modelo de contrato</p>
          </div>
        </div>

        {schoolId ? (
          <ContractForm schoolId={schoolId} />
        ) : (
          <div className="text-sm text-muted-foreground">Escola não encontrada no contexto.</div>
        )}
      </div>
    </EscolaLayout>
  )
}
