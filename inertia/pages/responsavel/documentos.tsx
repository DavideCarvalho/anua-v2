import { Head } from '@inertiajs/react'
import { Suspense, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { FileText, User } from 'lucide-react'

import { ResponsavelLayout } from '../../components/layouts'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import {
  StudentDocumentsContainer,
  StudentDocumentsContainerSkeleton,
} from '../../containers/responsavel/student-documents-container'

function StudentSelector({
  students,
  selectedId,
  onSelect,
}: {
  students: Array<{ id: string; name: string; className: string }>
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {students.map((student) => (
        <Button
          key={student.id}
          variant={selectedId === student.id ? 'default' : 'outline'}
          onClick={() => onSelect(student.id)}
          className="gap-2"
        >
          <User className="h-4 w-4" />
          {student.name}
          <span className="text-xs opacity-70">({student.className})</span>
        </Button>
      ))}
    </div>
  )
}

function DocumentosContent() {
  const { data } = useSuspenseQuery(useResponsavelStatsQueryOptions())
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    data.students.length > 0 ? data.students[0].id : null
  )

  const selectedStudent = data.students.find((s) => s.id === selectedStudentId)

  if (data.students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum aluno vinculado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Voce nao possui alunos vinculados a sua conta.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {data.students.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-medium">Selecione um aluno:</p>
            <StudentSelector
              students={data.students}
              selectedId={selectedStudentId}
              onSelect={setSelectedStudentId}
            />
          </CardContent>
        </Card>
      )}

      {selectedStudentId && selectedStudent && (
        <Suspense fallback={<StudentDocumentsContainerSkeleton />}>
          <StudentDocumentsContainer
            studentId={selectedStudentId}
            studentName={selectedStudent.name}
          />
        </Suspense>
      )}
    </div>
  )
}

function DocumentosSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 w-32 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
      <StudentDocumentsContainerSkeleton />
    </div>
  )
}

export default function DocumentosPage() {
  return (
    <ResponsavelLayout>
      <Head title="Documentos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documentos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe os documentos enviados e pendentes dos seus filhos
          </p>
        </div>

        <Suspense fallback={<DocumentosSkeleton />}>
          <DocumentosContent />
        </Suspense>
      </div>
    </ResponsavelLayout>
  )
}
