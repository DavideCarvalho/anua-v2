import { Head, usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { EscolaLayout } from '../../../../components/layouts'
import { Button } from '../../../../components/ui/button'
import { ContractForm } from '../../../../containers/contracts/contract-form'
import { useContractQueryOptions } from '../../../../hooks/queries/use_contract'
import type { SharedProps } from '../../../../lib/types'

interface PageProps extends SharedProps {
  id: string
}

export default function EditarContratoPage() {
  const { props } = usePage<PageProps>()
  const schoolId = props.user?.schoolId
  const contractId = props.id

  const { data: contract, isLoading, error } = useQuery(
    useContractQueryOptions(contractId)
  )

  return (
    <EscolaLayout>
      <Head title={`Editar ${contract?.name || 'Contrato'}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.administrativo.contratos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Contrato</h1>
            <p className="text-muted-foreground">{contract?.name || 'Carregando...'}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">
            Erro ao carregar contrato: {error.message}
          </div>
        ) : schoolId && contract ? (
          <ContractForm key={contract.id} schoolId={schoolId} initialData={contract} />
        ) : (
          <div className="text-sm text-muted-foreground">
            Contrato não encontrado.
          </div>
        )}
      </div>
    </EscolaLayout>
  )
}
