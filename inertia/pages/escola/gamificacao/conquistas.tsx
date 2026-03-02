import { Head } from '@inertiajs/react'
import { Trophy, AlertCircle } from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { AchievementsTable } from '../../../containers/gamificacao/achievements-table'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown
  resetErrorBoundary: () => void
}) {
  const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center gap-4 py-10">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="font-semibold text-destructive">Erro ao carregar conquistas</h3>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        <Button variant="outline" onClick={resetErrorBoundary}>
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ConquistasPage() {
  return (
    <EscolaLayout>
      <Head title="Conquistas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Conquistas
          </h1>
          <p className="text-muted-foreground">
            Gerencie badges e conquistas disponíveis para os alunos
          </p>
        </div>

        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AchievementsTable />
        </ErrorBoundary>
      </div>
    </EscolaLayout>
  )
}
