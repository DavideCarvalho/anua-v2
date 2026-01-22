import { useQuery } from '@tanstack/react-query'
import { BookOpen, Loader2 } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { ErrorBoundary } from '~/components/error-boundary'
import { SubjectGradesTable } from './subject-grades-table'

interface GradesAccordionProps {
  classId: string
}

interface Subject {
  id: string
  name: string
}

async function fetchSubjectsForClass(classId: string): Promise<Subject[]> {
  const response = await fetch(`/api/v1/classes/${classId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch class data')
  }
  const data = await response.json()

  const subjects: Subject[] = []
  const seen = new Set<string>()

  for (const tc of data.teacherClasses || []) {
    if (tc.subject && !seen.has(tc.subject.id)) {
      seen.add(tc.subject.id)
      subjects.push({
        id: tc.subject.id,
        name: tc.subject.name,
      })
    }
  }

  return subjects
}

function GradesAccordionSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function GradesAccordionEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhuma matéria</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Não há matérias cadastradas para esta turma.
      </p>
    </div>
  )
}

function GradesAccordionContent({ classId }: GradesAccordionProps) {
  const { data: subjects, isLoading, isError } = useQuery({
    queryKey: ['class-subjects-for-grades', classId],
    queryFn: () => fetchSubjectsForClass(classId),
  })

  if (isLoading) {
    return <GradesAccordionSkeleton />
  }

  if (isError || !subjects) {
    return (
      <div className="text-center text-destructive py-8">
        Erro ao carregar matérias
      </div>
    )
  }

  if (subjects.length === 0) {
    return <GradesAccordionEmpty />
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {subjects.map((subject) => (
        <AccordionItem key={subject.id} value={subject.id}>
          <AccordionTrigger className="text-base font-semibold">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {subject.name}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SubjectGradesTable classId={classId} subjectId={subject.id} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export function GradesAccordion(props: GradesAccordionProps) {
  return (
    <ErrorBoundary>
      <GradesAccordionContent {...props} />
    </ErrorBoundary>
  )
}
