import { Head } from '@inertiajs/react'
import { ErrorBoundary } from 'react-error-boundary'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Copy, ExternalLink, Loader2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { ResponsavelLayout } from '../../components/layouts'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { useSelectedStudent } from '../../hooks/use_selected_student'
import { api } from '../../lib/api'
import {
  StudentCalendarContainer,
  StudentCalendarContainerSkeleton,
} from '../../containers/responsavel/student-calendar-container'

function CalendarSyncButton({ studentId }: { studentId: string }) {
  const { data, isLoading } = useQuery(
    api.api.v1.responsavel.api.studentCalendarFeedUrl.queryOptions({
      params: { studentId },
    })
  )

  const feedUrl = data?.feedUrl ?? null
  const webcalUrl = feedUrl?.replace(/^https?:\/\//, 'webcal://')
  const googleUrl = feedUrl
    ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl ?? feedUrl)}`
    : null

  const handleCopy = () => {
    if (!feedUrl) return
    navigator.clipboard.writeText(feedUrl)
    toast.success('Link copiado!')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
          )}
          Sincronizar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2" align="end">
        <p className="text-sm font-medium">Adicionar ao calendário</p>
        <p className="text-xs text-muted-foreground">
          Provas, atividades e eventos sincronizam automaticamente.
        </p>
        <div className="space-y-1.5 pt-1">
          {googleUrl && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              Google Calendar
            </a>
          )}
          {webcalUrl && (
            <a
              href={webcalUrl}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              Apple Calendar
            </a>
          )}
          {feedUrl && (
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              Copiar link
            </button>
          )}
          {isLoading && <p className="text-xs text-muted-foreground">Gerando link...</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NoStudentCard() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum aluno selecionado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um aluno no menu acima para ver o calendario.
        </p>
      </CardContent>
    </Card>
  )
}

function CalendarioContent() {
  const { student, isLoaded } = useSelectedStudent()

  if (!isLoaded) {
    return <StudentCalendarContainerSkeleton />
  }

  if (!student) {
    return <NoStudentCard />
  }

  return <StudentCalendarContainer studentId={student.id} studentName={student.name} />
}

export default function CalendarioPage() {
  const { student } = useSelectedStudent()

  return (
    <ResponsavelLayout>
      <Head title="Calendário" />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <CalendarDays className="h-6 w-6" />
              Calendário
            </h1>
            <p className="text-muted-foreground">
              Visualize atividades, provas e eventos do aluno selecionado.
            </p>
          </div>
          {student && <CalendarSyncButton studentId={student.id} />}
        </div>

        <ErrorBoundary
          fallback={
            <Card>
              <CardContent className="py-12 text-center">
                <XCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Erro ao carregar dados</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ocorreu um erro ao renderizar o componente.
                </p>
              </CardContent>
            </Card>
          }
        >
          <CalendarioContent />
        </ErrorBoundary>
      </div>
    </ResponsavelLayout>
  )
}
