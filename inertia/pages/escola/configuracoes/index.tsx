import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'

export default function ConfiguracoesPage() {
  return (
    <EscolaLayout>
      <Head title="Configurações" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Preferências e configurações da escola</p>
        </div>

        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Configurações da escola (em construção)
          </CardContent>
        </Card>
      </div>
    </EscolaLayout>
  )
}
