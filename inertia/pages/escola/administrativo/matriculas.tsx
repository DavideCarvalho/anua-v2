import { Head } from '@inertiajs/react'
import { EscolaLayout } from '../../../components/layouts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { FileText, UserPlus, ClipboardList } from 'lucide-react'

export default function MatriculasPage() {
  return (
    <EscolaLayout>
      <Head title="Matrículas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matrículas</h1>
          <p className="text-muted-foreground">
            Gerencie o processo de matrícula de novos alunos
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <UserPlus className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Nova Matrícula</CardTitle>
              <CardDescription>
                Iniciar processo de matrícula para um novo aluno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Iniciar Matrícula</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <ClipboardList className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Matrículas Pendentes</CardTitle>
              <CardDescription>
                Visualizar matrículas aguardando aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Ver Pendentes</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Rematrículas</CardTitle>
              <CardDescription>
                Gerenciar processo de rematrícula dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Gerenciar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </EscolaLayout>
  )
}
