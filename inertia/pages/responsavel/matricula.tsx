import { Head, usePage } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { XCircle, GraduationCap } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import {
  MatriculaAxesContainer,
  MatriculaAxesSkeleton,
} from '../../containers/responsavel/matricula-axes-container'

interface PageProps {
  matriculaId: string
  [key: string]: any
}

export default function MatriculaPage() {
  const { matriculaId } = usePage<PageProps>().props

  return (
    <ResponsavelLayout>
      <Head title="Minha matrícula" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Minha matrícula
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o que falta pra concluir sua matrícula.
          </p>
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
              </CardContent>
            </Card>
          }
        >
          {matriculaId ? (
            <MatriculaAxesContainer matriculaId={matriculaId} />
          ) : (
            <MatriculaAxesSkeleton />
          )}
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
