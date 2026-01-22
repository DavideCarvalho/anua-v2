import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { buttonVariants } from '../../../components/ui/button'
import { Calendar, Clock, BookOpen } from 'lucide-react'
import { cn } from '../../../lib/utils'

export default function GradePage() {
  return (
    <EscolaLayout>
      <Head title="Grade Curricular" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grade Curricular</h1>
          <p className="text-muted-foreground">
            Configure a grade de horários e disciplinas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Horários</CardTitle>
              <CardDescription>
                Configurar horários das aulas por turma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                route="web.escola.pedagogico.horarios"
                className={cn(buttonVariants(), 'w-full')}
              >
                Gerenciar Horários
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Disciplinas</CardTitle>
              <CardDescription>
                Vincular disciplinas às turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                route="web.escola.administrativo.materias"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                Ver Disciplinas
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Quadro Geral</CardTitle>
              <CardDescription>
                Visualizar grade completa da escola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                route="web.escola.pedagogico.quadro"
                className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
              >
                Ver Quadro
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </EscolaLayout>
  )
}
