import { Head, router } from '@inertiajs/react'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'

import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'

type Props = {
  comunicadoId: string
}

type Option = {
  id: string
  name: string
}

type ApiListResponse = {
  data: Option[]
}

type AnnouncementResponse = {
  id: string
  title: string
  body: string
  status: 'DRAFT' | 'PUBLISHED'
  requiresAcknowledgement?: boolean
  acknowledgementDueAt?: string | null
  audiences?: Array<{
    scopeType: 'ACADEMIC_PERIOD' | 'COURSE' | 'LEVEL' | 'CLASS'
    scopeId: string
  }>
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

export default function EditarComunicadoPage({ comunicadoId }: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    let cancelled = false

    async function loadAnnouncement() {
      try {
        const response = await fetch(`/api/v1/school-announcements/${comunicadoId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar comunicado')
        }

        const data = (await response.json()) as AnnouncementResponse
        if (!cancelled) {
          setTitle(data.title)
          setBody(data.body)
          setRequiresAcknowledgement(Boolean(data.requiresAcknowledgement))
          setAcknowledgementDueAt(
            data.acknowledgementDueAt
              ? new Date(data.acknowledgementDueAt).toISOString().slice(0, 16)
              : ''
          )
          const audiences = data.audiences ?? []
          setAudienceAcademicPeriodIds(
            audiences
              .filter((item) => item.scopeType === 'ACADEMIC_PERIOD')
              .map((item) => item.scopeId)
          )
          setAudienceCourseIds(
            audiences.filter((item) => item.scopeType === 'COURSE').map((item) => item.scopeId)
          )
          setAudienceLevelIds(
            audiences.filter((item) => item.scopeType === 'LEVEL').map((item) => item.scopeId)
          )
          setAudienceClassIds(
            audiences.filter((item) => item.scopeType === 'CLASS').map((item) => item.scopeId)
          )
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar comunicado')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadAnnouncement()

    return () => {
      cancelled = true
    }
  }, [comunicadoId])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/v1/school-announcements/${comunicadoId}`, {
        method: 'PUT',
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
        throw new Error('Falha ao atualizar comunicado')
      }

      router.visit('/escola/comunicados')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao atualizar comunicado')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EscolaLayout>
      <Head title="Editar Comunicado" />

      <Card>
        <CardHeader>
          <CardTitle>Editar comunicado</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Titulo
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
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
                  rows={8}
                  required
                />
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <p className="text-sm font-semibold">Publico-alvo do comunicado</p>

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

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  Salvar alteracoes
                </Button>
                <Link href="/escola/comunicados">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </EscolaLayout>
  )
}
