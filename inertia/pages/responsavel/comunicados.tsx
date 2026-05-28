import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { Bell, XCircle } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { ComunicadosContent } from '../../containers/responsavel/comunicados-content'

export default function ComunicadosPage() {
  return (
    <ResponsavelLayout>
      <Head title="Comunicados" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Comunicados
          </h1>
          <p className="text-muted-foreground">Comunicados oficiais enviados pela escola</p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar comunicados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <ComunicadosContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
