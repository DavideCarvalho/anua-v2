import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { Settings } from 'lucide-react'

import { EscolaLayout } from '../../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../../components/ui/card'
import { ContractFinancialConfig } from '../../../../containers/contracts/contract-financial-config'

function ConfigSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function ContratoFinanceiroPage() {
  const { props } = usePage<{ contractId?: string }>()
  const contractId = props.contractId

  return (
    <EscolaLayout>
      <Head title="Configuração Financeira do Contrato" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuração Financeira
          </h1>
          <p className="text-muted-foreground">
            Configure dias de pagamento, juros e descontos do contrato
          </p>
        </div>

        {contractId ? (
          <Suspense fallback={<ConfigSkeleton />}>
            <ContractFinancialConfig contractId={contractId} />
          </Suspense>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Contrato não informado.
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
