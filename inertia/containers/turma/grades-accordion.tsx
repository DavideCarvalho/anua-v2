import { useMemo } from 'react'
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
import { useClassQueryOptions } from '~/hooks/queries/use_class'

interface GradesAccordionProps {
  classId: string
  courseId: string
  academicPeriodId: string
}

interface Subject {
  id: string
  name: string
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

function GradesAccordionContent({ classId, courseId, academicPeriodId }: GradesAccordionProps) {
  const { data: classData, isLoading, isError } = useQuery(useClassQueryOptions(classId))

  const subjects = useMemo(() => {
    if (!classData) return []
    const result: Subject[] = []
    const seen = new Set<string>()
    for (const tc of (classData as any).teacherClasses || []) {
      if (tc.subject && !seen.has(tc.subject.id)) {
        seen.add(tc.subject.id)
        result.push({ id: tc.subject.id, name: tc.subject.name })
      }
    }
    return result
  }, [classData])

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
            <SubjectGradesTable classId={classId} subjectId={subject.id} courseId={courseId} academicPeriodId={academicPeriodId} />
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
