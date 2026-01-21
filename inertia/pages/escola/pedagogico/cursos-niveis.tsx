import { Head, usePage } from '@inertiajs/react'
import { Suspense } from 'react'
import { GraduationCap } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { CoursesLevelsTable } from '../../../containers/academic/courses-levels-table'
import type { SharedProps } from '../../../lib/types'

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CursosNiveisPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Cursos e Níveis" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Cursos e Níveis
          </h1>
          <p className="text-muted-foreground">
            Gerencie a estrutura acadêmica da escola
          </p>
        </div>

        {schoolId ? (
          <Suspense fallback={<TableSkeleton />}>
            <CoursesLevelsTable schoolId={schoolId} />
          </Suspense>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Escola não encontrada no contexto do usuário.
            </CardContent>
          </Card>
        )}
      </div>
    </EscolaLayout>
  )
}
