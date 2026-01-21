import { Head, usePage } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { Plus, FileText, Filter } from 'lucide-react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'

import { AssignmentsList, AssignmentsListSkeleton } from '../../../containers/academico/assignments-list'

interface PageProps {
  schoolId: string
  classes?: Array<{ id: string; name: string }>
  subjects?: Array<{ id: string; name: string }>
  [key: string]: any
}

export default function AtividadesPage() {
  const { schoolId, classes = [], subjects = [] } = usePage<PageProps>().props
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')

  return (
    <EscolaLayout>
      <Head title="Atividades" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Atividades
            </h1>
            <p className="text-muted-foreground">Gerencie atividades e tarefas dos alunos</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as turmas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as materias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as materias</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        <Suspense fallback={<AssignmentsListSkeleton />}>
          <AssignmentsList
            classId={selectedClass || undefined}
            subjectId={selectedSubject || undefined}
            onView={(id) => {
              window.location.href = `/escola/${schoolId}/pedagogico/atividades/${id}`
            }}
            onEdit={(id) => {
              window.location.href = `/escola/${schoolId}/pedagogico/atividades/${id}/editar`
            }}
          />
        </Suspense>
      </div>
    </EscolaLayout>
  )
}
