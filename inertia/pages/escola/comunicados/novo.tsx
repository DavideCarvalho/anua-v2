import { Head, router } from '@inertiajs/react'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'

import { EscolaLayout } from '../../../components/layouts'
import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

type Option = {
  id: string
  name: string
  isActive?: boolean
}

type ApiListResponse = {
  data: Option[]
}

type AudiencePreset = 'all' | 'course' | 'level' | 'class'

type AudienceOptionGroup = {
  label: string
  ids: string[]
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

function groupOptionsByLabel(options: Option[]): AudienceOptionGroup[] {
  const grouped = new Map<string, string[]>()

  for (const item of options) {
    const label = item.name.trim()
    const ids = grouped.get(label) ?? []
    ids.push(item.id)
    grouped.set(label, ids)
  }

  return Array.from(grouped.entries())
    .map(([label, ids]) => ({ label, ids }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

function toggleGroupSelection(selectedValues: string[], groupIds: string[]) {
  const allSelected = groupIds.every((id) => selectedValues.includes(id))

  if (allSelected) {
    return selectedValues.filter((id) => !groupIds.includes(id))
  }

  return Array.from(new Set([...selectedValues, ...groupIds]))
}

function countSelectedGroups(groups: AudienceOptionGroup[], selectedValues: string[]) {
  return groups.filter((group) => group.ids.some((id) => selectedValues.includes(id))).length
}

function formatAudienceGroupLabel(group: AudienceOptionGroup) {
  if (group.ids.length <= 1) {
    return group.label
  }

  return `${group.label} (${group.ids.length})`
}

export default function NovoComunicadoPage() {
  const user = useAuthUser()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')
  const [courses, setCourses] = useState<Option[]>([])
  const [levels, setLevels] = useState<Option[]>([])
  const [classes, setClasses] = useState<Option[]>([])
  const [audiencePreset, setAudiencePreset] = useState<AudiencePreset>('all')
  const [audienceAcademicPeriodIds, setAudienceAcademicPeriodIds] = useState<string[]>([])
  const [audienceCourseIds, setAudienceCourseIds] = useState<string[]>([])
  const [audienceLevelIds, setAudienceLevelIds] = useState<string[]>([])
  const [audienceClassIds, setAudienceClassIds] = useState<string[]>([])
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false)
  const [acknowledgementDueAt, setAcknowledgementDueAt] = useState('')

  useEffect(() => {
    setViewMode(readEscolaDashboardViewMode(user?.id))
  }, [user?.id])

  const onViewModeChange = (mode: EscolaDashboardViewMode) => {
    setViewMode(mode)
    writeEscolaDashboardViewMode(user?.id, mode)
  }

  const viewModeToggle = (
    <>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'full' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('full')}
      >
        Visão completa
      </Button>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'simple' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('simple')}
      >
        Visão simplificada
      </Button>
    </>
  )

  useEffect(() => {
    let cancelled = false

    async function loadAudienceOptions() {
      const [courseOptions, levelOptions, classOptions] = await Promise.all([
        fetchOptions('/api/v1/courses'),
        fetchOptions('/api/v1/levels'),
        fetchOptions('/api/v1/classes'),
      ])

      if (cancelled) {
        return
      }

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
    audiencePreset === 'all'
      ? classes.length > 0
      : audiencePreset === 'course'
        ? audienceCourseIds.length > 0
        : audiencePreset === 'level'
          ? audienceLevelIds.length > 0
        : audienceClassIds.length > 0

  const courseGroups = groupOptionsByLabel(courses)
  const activeLevels = levels.filter((item) => item.isActive !== false)
  const levelGroups = groupOptionsByLabel(activeLevels)

  function selectAudiencePreset(preset: AudiencePreset) {
    setAudiencePreset(preset)
    setAudienceAcademicPeriodIds([])
    setAudienceCourseIds([])
    setAudienceLevelIds([])
    setAudienceClassIds([])
  }

  function getAudienceSummary() {
    if (audiencePreset === 'all') {
      return classes.length > 0
        ? `Toda escola (${classes.length} turmas incluidas)`
        : 'Toda escola (nenhuma turma disponivel para envio)'
    }

    if (audiencePreset === 'course') {
      return `${countSelectedGroups(courseGroups, audienceCourseIds)} curso(s) selecionado(s)`
    }

    if (audiencePreset === 'level') {
      return `${countSelectedGroups(levelGroups, audienceLevelIds)} ano(s) selecionado(s)`
    }

    return `${audienceClassIds.length} turma(s) selecionada(s)`
  }

  function buildAudiencePayload() {
    if (audiencePreset === 'all') {
      return {
        audienceAcademicPeriodIds: [] as string[],
        audienceCourseIds: [] as string[],
        audienceLevelIds: [] as string[],
        audienceClassIds: classes.map((item) => item.id),
      }
    }

    return {
      audienceAcademicPeriodIds,
      audienceCourseIds,
      audienceLevelIds,
      audienceClassIds,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const audiencePayload = buildAudiencePayload()

      const response = await fetch('/api/v1/school-announcements', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          audienceAcademicPeriodIds: audiencePayload.audienceAcademicPeriodIds,
          audienceCourseIds: audiencePayload.audienceCourseIds,
          audienceLevelIds: audiencePayload.audienceLevelIds,
          audienceClassIds: audiencePayload.audienceClassIds,
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

  const audienceSelectionWarning =
    audiencePreset === 'all'
      ? 'Nenhuma turma encontrada para enviar o comunicado para toda a escola.'
      : 'Selecione ao menos um publico para publicar este comunicado.'

  const content = (
    <>
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
                Escolha um modo simples de envio. Voce pode detalhar somente quando precisar.
              </p>

              <div data-testid="announcement-audience-presets" className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={audiencePreset === 'all' ? 'default' : 'outline'}
                  onClick={() => selectAudiencePreset('all')}
                >
                  Toda escola
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={audiencePreset === 'course' ? 'default' : 'outline'}
                  onClick={() => selectAudiencePreset('course')}
                >
                  Por curso
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={audiencePreset === 'level' ? 'default' : 'outline'}
                  onClick={() => selectAudiencePreset('level')}
                >
                  Por ano
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={audiencePreset === 'class' ? 'default' : 'outline'}
                  onClick={() => selectAudiencePreset('class')}
                >
                  Por turma
                </Button>
              </div>

              {audiencePreset === 'course' && (
                <div className="space-y-2" data-testid="announcement-audience-course-options">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Selecione os cursos</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAudienceCourseIds([])}
                    >
                      Limpar selecao
                    </Button>
                  </div>
                  <div className="grid gap-1">
                    {courseGroups.map((group) => (
                      <label key={group.label} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={group.ids.every((id) => audienceCourseIds.includes(id))}
                          onChange={() =>
                            setAudienceCourseIds((previous) =>
                              toggleGroupSelection(previous, group.ids)
                            )
                          }
                        />
                        {formatAudienceGroupLabel(group)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {audiencePreset === 'level' && (
                <div className="space-y-2" data-testid="announcement-audience-level-options">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Selecione os anos</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAudienceLevelIds([])}
                    >
                      Limpar selecao
                    </Button>
                  </div>
                  <div className="grid gap-1">
                    {levelGroups.map((group) => (
                      <label key={group.label} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={group.ids.every((id) => audienceLevelIds.includes(id))}
                          onChange={() =>
                            setAudienceLevelIds((previous) =>
                              toggleGroupSelection(previous, group.ids)
                            )
                          }
                        />
                        {formatAudienceGroupLabel(group)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {audiencePreset === 'class' && (
                <div className="space-y-2" data-testid="announcement-audience-class-options">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Selecione as turmas</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setAudienceClassIds([])}
                    >
                      Limpar selecao
                    </Button>
                  </div>
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
              )}

              <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium">Resumo do publico:</span> {getAudienceSummary()}
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

            {!hasAudienceSelection && <p className="text-sm text-amber-600">{audienceSelectionWarning}</p>}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isSubmitting || !hasAudienceSelection}>
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
    </>
  )

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Novo comunicado"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      >
        {content}
      </EscolaLayoutSimplificado>
    )
  }

  return <EscolaLayout topbarActions={viewModeToggle}>{content}</EscolaLayout>
}
