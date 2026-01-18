import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Calendar, Clock, BookOpen } from 'lucide-react'

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
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Horários</CardTitle>
              <CardDescription>
                Configurar horários das aulas por turma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Gerenciar Horários</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Disciplinas</CardTitle>
              <CardDescription>
                Vincular disciplinas às turmas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Ver Disciplinas</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Quadro Geral</CardTitle>
              <CardDescription>
                Visualizar grade completa da escola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Ver Quadro</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </EscolaLayout>
  )
}
