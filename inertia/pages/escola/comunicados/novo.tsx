import { Head, router } from '@inertiajs/react'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'

type Option = {
  id: string
  name: string
}

type ApiListResponse = {
  data: Option[]
}

async function fetchOptions(url: string): Promise<Option[]> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as ApiListResponse
  return payload.data ?? []
}

function toggleArrayValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value)
  }

  return [...values, value]
}

export default function NovoComunicadoPage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [academicPeriods, setAcademicPeriods] = useState<Option[]>([])
  const [courses, setCourses] = useState<Option[]>([])
  const [levels, setLevels] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [audienceAcademicPeriodIds, setAudienceAcademicPeriodIds] = useState<string[]>([])
  const [audienceCourseIds, setAudienceCourseIds] = useState<string[]>([])
  const [audienceLevelIds, setAudienceLevelIds] = useState<string[]>([])
  const [audienceClassIds, setAudienceClassIds] = useState<string[]>([])
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false)
  const [acknowledgementDueAt, setAcknowledgementDueAt] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAudienceOptions() {
      const [periodOptions, courseOptions, levelOptions, classOptions] = await Promise.all([
        fetchOptions('/api/v1/academic-periods'),
        fetchOptions('/api/v1/courses'),
        fetchOptions('/api/v1/levels'),
        fetchOptions('/api/v1/classes'),
      ])

      if (cancelled) {
        return
      }

      setAcademicPeriods(periodOptions)
      setCourses(courseOptions)
      setLevels(levelOptions)
      setClasses(classOptions)
    }

    void loadAudienceOptions()

    return () => {
      cancelled = true
    }
  }, [])

  const hasAudienceSelection =
    audienceAcademicPeriodIds.length > 0 ||
    audienceCourseIds.length > 0 ||
    audienceLevelIds.length > 0 ||
    audienceClassIds.length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/school-announcements', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          audienceAcademicPeriodIds,
          audienceCourseIds,
          audienceLevelIds,
          audienceClassIds,
          requiresAcknowledgement,
          acknowledgementDueAt:
            requiresAcknowledgement && acknowledgementDueAt
              ? new Date(acknowledgementDueAt).toISOString()
              : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar comunicado')
      }

      router.visit('/escola/comunicados')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao salvar comunicado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EscolaLayout>
      <Head title="Novo Comunicado" />

      <Card>
        <CardHeader>
          <CardTitle>Novo comunicado</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Titulo
              </label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Assunto do comunicado"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="body" className="text-sm font-medium">
                Mensagem
              </label>
              <Textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Escreva o comunicado para os responsaveis"
                rows={8}
                required
              />
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <p className="text-sm font-semibold">Publico-alvo do comunicado</p>
              <p className="text-xs text-muted-foreground">
                Selecione pelo menos um periodo, curso, ano ou turma.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium">Periodos letivos</p>
                <div className="grid gap-1">
                  {academicPeriods.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={audienceAcademicPeriodIds.includes(item.id)}
                        onChange={() =>
                          setAudienceAcademicPeriodIds((previous) =>
                            toggleArrayValue(previous, item.id)
                          )
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Cursos</p>
                <div className="grid gap-1">
                  {courses.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={audienceCourseIds.includes(item.id)}
                        onChange={() =>
                          setAudienceCourseIds((previous) => toggleArrayValue(previous, item.id))
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Anos</p>
                <div className="grid gap-1">
                  {levels.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={audienceLevelIds.includes(item.id)}
                        onChange={() =>
                          setAudienceLevelIds((previous) => toggleArrayValue(previous, item.id))
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Turmas</p>
                <div className="grid gap-1">
                  {classes.map((item) => (
                    <label key={item.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={audienceClassIds.includes(item.id)}
                        onChange={() =>
                          setAudienceClassIds((previous) => toggleArrayValue(previous, item.id))
                        }
                      />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <p className="text-sm font-semibold">Ciencia do responsavel</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={requiresAcknowledgement}
                  onChange={(event) => setRequiresAcknowledgement(event.target.checked)}
                />
                Exigir que o responsavel marque "Li e estou ciente"
              </label>

              {requiresAcknowledgement && (
                <div className="space-y-2">
                  <label htmlFor="acknowledgementDueAt" className="text-xs font-medium">
                    Prazo da ciencia (opcional)
                  </label>
                  <Input
                    id="acknowledgementDueAt"
                    type="datetime-local"
                    value={acknowledgementDueAt}
                    onChange={(event) => setAcknowledgementDueAt(event.target.value)}
                  />
                </div>
              )}
            </div>

            {!hasAudienceSelection && (
              <p className="text-sm text-amber-600">
                Selecione ao menos um publico para publicar este comunicado.
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting}>
                Salvar rascunho
              </Button>
              <Link href="/escola/comunicados">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </EscolaLayout>
  )
}
