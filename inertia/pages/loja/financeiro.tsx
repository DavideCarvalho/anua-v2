import { Head } from '@inertiajs/react'
import { LojaLayout } from '../../components/layouts/loja-layout'
import { StoreOwnerFinancialContainer } from '../../containers/store-owner-financial-container'

export default function LojaFinanceiroPage() {
  return (
    <LojaLayout>
      <Head title="Financeiro" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Configurações financeiras e repasses</p>
        </div>
        <StoreOwnerFinancialContainer />
      </div>
    </LojaLayout>
  )
}
