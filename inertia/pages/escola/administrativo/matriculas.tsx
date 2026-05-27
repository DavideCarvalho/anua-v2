import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { EscolaLayout } from '../../../components/layouts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { FileText, UserPlus, ClipboardList, ArrowRight } from 'lucide-react'

export default function MatriculasPage() {
  return (
    <EscolaLayout>
      <Head title="Matrículas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matrículas</h1>
          <p className="text-muted-foreground">Gerencie o processo de matrícula de novos alunos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link route="web.escola.administrativo.matriculas.nova">
            <Card className="h-full hover:bg-muted/30 transition-colors">
              <CardHeader>
                <UserPlus className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Nova Matrícula</CardTitle>
                <CardDescription>Iniciar processo de matrícula para um novo aluno</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  Iniciar Matrícula
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link route="web.escola.periodosLetivos">
            <Card className="h-full hover:bg-muted/30 transition-colors">
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Matrículas por Período</CardTitle>
                <CardDescription>
                  Veja matrículas pendentes e aprovadas por período letivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  Ver Períodos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link route="web.escola.administrativo.alunos">
            <Card className="h-full hover:bg-muted/30 transition-colors">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Alunos Matriculados</CardTitle>
                <CardDescription>Lista completa de alunos com filtros por turma e curso</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  Ver Alunos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </EscolaLayout>
  )
}
