import { Head, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { Plus, ClipboardList, Filter } from 'lucide-react'

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

import { ExamsList } from '../../../containers/academico/exams-list'

interface PageProps {
  schoolId: string
  classes?: Array<{ id: string; name: string }>
  subjects?: Array<{ id: string; name: string }>
  [key: string]: unknown
}

export default function ProvasPage() {
  const { classes = [], subjects = [] } = usePage<PageProps>().props
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  return (
    <EscolaLayout>
      <Head title="Provas" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Provas e Avaliacoes
            </h1>
            <p className="text-muted-foreground">Gerencie provas e avaliacoes dos alunos</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Prova
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedClass || 'all'}
                onValueChange={(v) => setSelectedClass(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSubject || 'all'}
                onValueChange={(v) => setSelectedSubject(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as materias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as materias</SelectItem>
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

        {/* Exams List */}
        <ExamsList classId={selectedClass || undefined} subjectId={selectedSubject || undefined} />
      </div>
    </EscolaLayout>
  )
}
