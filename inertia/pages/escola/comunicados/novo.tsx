import { Head, router } from '@inertiajs/react'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Link } from '@adonisjs/inertia/react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { EscolaLayout } from '../../../components/layouts'
import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/ui/command'
import { Input } from '../../../components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { Textarea } from '../../../components/ui/textarea'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'
import { Check, ChevronsUpDown, X } from 'lucide-react'

type Option = {
  id: string
  name: string
  isActive?: boolean
}

type StudentOption = Option & {
  className?: string | null
}

type ApiListResponse<TOption extends Option = Option> = {
  data: TOption[]
}

type AudiencePreset = 'all' | 'course' | 'level' | 'class' | 'student'

type AudienceOptionGroup = {
  label: string
  ids: string[]
}

async function fetchOptions<TOption extends Option = Option>(url: string): Promise<TOption[]> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    return []
  }

  const payload = (await response.json()) as ApiListResponse<TOption>
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
  const [students, setStudents] = useState<StudentOption[]>([])
  const [studentPickerOpen, setStudentPickerOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [audiencePreset, setAudiencePreset] = useState<AudiencePreset>('all')
  const [audienceAcademicPeriodIds, setAudienceAcademicPeriodIds] = useState<string[]>([])
  const [audienceCourseIds, setAudienceCourseIds] = useState<string[]>([])
  const [audienceLevelIds, setAudienceLevelIds] = useState<string[]>([])
  const [audienceClassIds, setAudienceClassIds] = useState<string[]>([])
  const [audienceStudentIds, setAudienceStudentIds] = useState<string[]>([])
  const [requiresAcknowledgement, setRequiresAcknowledgement] = useState(false)
  const [acknowledgementDueAt, setAcknowledgementDueAt] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const createAnnouncementMutation = useMutation<unknown, Error, { body: FormData }>({
    mutationKey: ['school-announcements', 'create'],
    mutationFn: async ({ body }) => {
      const response = await fetch('/api/v1/school-announcements', {
        method: 'POST',
        credentials: 'include',
        body,
      })

      if (!response.ok) {
        throw new Error('Falha ao criar comunicado')
      }

      return response.json()
    },
  })

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
      const [courseOptions, levelOptions, classOptions, studentOptions] = await Promise.all([
        fetchOptions('/api/v1/courses'),
        fetchOptions('/api/v1/levels'),
        fetchOptions('/api/v1/classes'),
        fetchOptions<StudentOption>('/api/v1/school-announcements/audience/students'),
      ])

      if (cancelled) {
        return
      }

      setCourses(courseOptions)
      setLevels(levelOptions)
      setClasses(classOptions)
      setStudents(studentOptions)
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
          : audiencePreset === 'class'
            ? audienceClassIds.length > 0
            : audienceStudentIds.length > 0

  const courseGroups = groupOptionsByLabel(courses)
  const activeLevels = levels.filter((item) => item.isActive !== false)
  const levelGroups = groupOptionsByLabel(activeLevels)

  const duplicatedStudentNameSet = new Set(
    students
      .reduce((accumulator, item) => {
        const currentCount = accumulator.get(item.name) ?? 0
        accumulator.set(item.name, currentCount + 1)
        return accumulator
      }, new Map<string, number>())
      .entries()
      .filter(([, count]) => count > 1)
      .map(([name]) => name)
  )

  function selectAudiencePreset(preset: AudiencePreset) {
    setAudiencePreset(preset)
    setAudienceAcademicPeriodIds([])
    setAudienceCourseIds([])
    setAudienceLevelIds([])
    setAudienceClassIds([])
    setAudienceStudentIds([])
  }

  const hasValidAttachments = attachments.length <= 5

  const onAttachmentsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    const next = [...attachments, ...files]
    if (next.length > 5) {
      toast.error('Máximo de 5 anexos por comunicado')
      event.target.value = ''
      return
    }

    setAttachments(next)
    event.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
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

    if (audiencePreset === 'class') {
      return `${audienceClassIds.length} turma(s) selecionada(s)`
    }

    return `${audienceStudentIds.length} aluno(s) selecionado(s)`
  }

  function buildAudiencePayload() {
    if (audiencePreset === 'all') {
      return {
        audienceAcademicPeriodIds: [] as string[],
        audienceCourseIds: [] as string[],
        audienceLevelIds: [] as string[],
        audienceClassIds: classes.map((item) => item.id),
        audienceStudentIds: [] as string[],
      }
    }

    return {
      audienceAcademicPeriodIds,
      audienceCourseIds,
      audienceLevelIds,
      audienceClassIds,
      audienceStudentIds,
    }
  }

  function formatStudentLabel(student: StudentOption) {
    if (!duplicatedStudentNameSet.has(student.name)) {
      return student.name
    }

    if (student.className) {
      return `${student.name} - ${student.className}`
    }

    return student.name
  }

  const filteredStudents = students.filter((student) => {
    if (!studentSearch.trim()) {
      return true
    }

    const normalizedSearch = studentSearch.toLowerCase()
    const label = formatStudentLabel(student).toLowerCase()

    return label.includes(normalizedSearch)
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const audiencePayload = buildAudiencePayload()
      const formData = new FormData()
      formData.append('title', title)
      formData.append('body', body)
      formData.append('requiresAcknowledgement', requiresAcknowledgement ? 'true' : 'false')

      if (requiresAcknowledgement && acknowledgementDueAt) {
        formData.append('acknowledgementDueAt', new Date(acknowledgementDueAt).toISOString())
      }

      for (const id of audiencePayload.audienceAcademicPeriodIds) {
        formData.append('audienceAcademicPeriodIds[]', id)
      }

      for (const id of audiencePayload.audienceCourseIds) {
        formData.append('audienceCourseIds[]', id)
      }

      for (const id of audiencePayload.audienceLevelIds) {
        formData.append('audienceLevelIds[]', id)
      }

      for (const id of audiencePayload.audienceClassIds) {
        formData.append('audienceClassIds[]', id)
      }

      for (const id of audiencePayload.audienceStudentIds) {
        formData.append('audienceStudentIds[]', id)
      }

      for (const file of attachments) {
        formData.append('attachments', file)
      }

      await createAnnouncementMutation.mutateAsync({
        body: formData,
      })

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

            <div className="space-y-2 rounded-md border p-4">
              <p className="text-sm font-semibold">Anexos</p>
              <Input
                type="file"
                multiple
                accept=".pdf,.docx,.jpg,.jpeg,.png,.webp"
                onChange={onAttachmentsChange}
              />
              <p className="text-xs text-muted-foreground">
                Tipos: PDF, DOCX, JPG, PNG, WEBP. Maximo 10MB por arquivo e 5 anexos.
              </p>
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={`${attachment.name}-${index}`}
                      className="flex items-center justify-between rounded border px-3 py-2 text-xs"
                    >
                      <span className="truncate">{attachment.name}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                <Button
                  type="button"
                  size="sm"
                  variant={audiencePreset === 'student' ? 'default' : 'outline'}
                  onClick={() => selectAudiencePreset('student')}
                >
                  Por aluno
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

              {audiencePreset === 'student' && (
                <div className="space-y-2" data-testid="announcement-audience-student-options">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium">Selecione por aluno</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAudienceStudentIds([])
                        setStudentSearch('')
                      }}
                    >
                      Limpar selecao
                    </Button>
                  </div>
                  <div className="space-y-2 rounded-md border border-border/70 p-2">
                    <Popover open={studentPickerOpen} onOpenChange={setStudentPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {audienceStudentIds.length > 0
                            ? `${audienceStudentIds.length} aluno(s) selecionado(s)`
                            : 'Buscar aluno...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] p-0"
                        align="start"
                      >
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Buscar aluno..."
                            value={studentSearch}
                            onValueChange={setStudentSearch}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum aluno encontrado</CommandEmpty>
                            {filteredStudents.length > 0 && (
                              <CommandGroup>
                                {filteredStudents.map((item) => {
                                  const isSelected = audienceStudentIds.includes(item.id)

                                  return (
                                    <CommandItem
                                      key={item.id}
                                      value={item.id}
                                      onSelect={() =>
                                        setAudienceStudentIds((previous) =>
                                          toggleArrayValue(previous, item.id)
                                        )
                                      }
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                                      />
                                      <span className="truncate">{formatStudentLabel(item)}</span>
                                    </CommandItem>
                                  )
                                })}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {audienceStudentIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {audienceStudentIds
                          .map((studentId) => students.find((student) => student.id === studentId))
                          .filter((student): student is StudentOption => Boolean(student))
                          .map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() =>
                                setAudienceStudentIds((previous) =>
                                  previous.filter((id) => id !== student.id)
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-1 text-xs transition-colors hover:bg-muted/70"
                            >
                              <span className="max-w-[16rem] truncate">
                                {formatStudentLabel(student)}
                              </span>
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ))}
                      </div>
                    )}
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

            {!hasAudienceSelection && (
              <p className="text-sm text-amber-600">{audienceSelectionWarning}</p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                disabled={isSubmitting || !hasAudienceSelection || !hasValidAttachments}
              >
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
