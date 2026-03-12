import { useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { api } from '~/lib/api'

interface PedagogicalContextRow {
  academicPeriodId: string
  academicPeriodName: string
  classId: string
  className: string
  levelId: string | null
  levelName: string | null
  subjectId: string
  subjectName: string
  teacherId: string
}

interface PedagogicalContextValue {
  academicPeriodId: string
  levelId: string
  classId: string
  subjectId: string
}

interface PedagogicalContextStepProps {
  value: PedagogicalContextValue
  onChange: (next: PedagogicalContextValue) => void
  onResolved: (
    resolved: {
      classId: string
      subjectId: string
      teacherId: string
      academicPeriodId: string
    } | null
  ) => void
}

export function PedagogicalContextStep({
  value,
  onChange,
  onResolved,
}: PedagogicalContextStepProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.pedagogicalCalendar.creationContext.queryOptions({})
  )

  const rows = (data?.data?.rows ?? []) as PedagogicalContextRow[]

  const periods = useMemo(
    () =>
      Array.from(
        new Map(rows.map((row) => [row.academicPeriodId, row.academicPeriodName])).entries()
      ).map(([id, name]) => ({ id, name })),
    [rows]
  )

  const levels = useMemo(
    () =>
      Array.from(
        new Map(
          rows
            .filter((row) => row.levelId)
            .map((row) => [row.levelId as string, row.levelName ?? 'Sem serie'])
        ).entries()
      ).map(([id, name]) => ({ id, name })),
    [rows]
  )

  const rowsByPeriod = useMemo(() => {
    if (!value.academicPeriodId) return []
    return rows.filter((row) => row.academicPeriodId === value.academicPeriodId)
  }, [rows, value.academicPeriodId])

  const classes = useMemo(() => {
    const filtered = value.levelId
      ? rowsByPeriod.filter((row) => row.levelId === value.levelId)
      : rowsByPeriod

    return Array.from(new Map(filtered.map((row) => [row.classId, row.className])).entries()).map(
      ([id, name]) => ({ id, name })
    )
  }, [rowsByPeriod, value.levelId])

  const subjects = useMemo(() => {
    if (!value.classId) return []

    return Array.from(
      new Map(
        rowsByPeriod
          .filter((row) => row.classId === value.classId)
          .map((row) => [
            `${row.subjectId}:${row.teacherId}`,
            { id: row.subjectId, name: row.subjectName, teacherId: row.teacherId },
          ])
      ).values()
    )
  }, [rowsByPeriod, value.classId])

  const canResolve = Boolean(value.academicPeriodId && value.classId && value.subjectId)

  const selectedPeriodName = periods.find((period) => period.id === value.academicPeriodId)?.name
  const selectedLevelName = value.levelId
    ? levels.find((level) => level.id === value.levelId)?.name
    : 'Todos'
  const selectedClassName = classes.find((classItem) => classItem.id === value.classId)?.name
  const selectedSubjectName = subjects.find((subject) => subject.id === value.subjectId)?.name

  useEffect(() => {
    if (!canResolve) {
      onResolved(null)
      return
    }

    const selected = subjects.find((subject) => subject.id === value.subjectId)
    if (!selected) {
      onResolved(null)
      return
    }

    onResolved({
      classId: value.classId,
      subjectId: selected.id,
      teacherId: selected.teacherId,
      academicPeriodId: value.academicPeriodId,
    })
  }, [canResolve, onResolved, subjects, value.academicPeriodId, value.classId, value.subjectId])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando contexto...
      </div>
    )
  }

  return (
    <div className="grid gap-4 py-2">
      <div className="space-y-2">
        <Label>Periodo letivo *</Label>
        <Select
          value={value.academicPeriodId}
          onValueChange={(periodId, _event) => {
            if (!periodId) return
            onChange({
              academicPeriodId: periodId,
              levelId: '',
              classId: '',
              subjectId: '',
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o periodo">
              {selectedPeriodName ?? 'Selecione o periodo'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.id} value={period.id}>
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Curso/Serie</Label>
        <Select
          value={value.levelId || '__all_levels__'}
          onValueChange={(levelId, _event) => {
            if (!levelId) return
            onChange({
              ...value,
              levelId: levelId === '__all_levels__' ? '' : levelId,
              classId: '',
              subjectId: '',
            })
          }}
          disabled={!value.academicPeriodId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os cursos/series">
              {selectedLevelName ?? 'Todos os cursos/series'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all_levels__">Todos</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Turma *</Label>
        <Select
          value={value.classId}
          onValueChange={(classId, _event) => {
            if (!classId) return
            onChange({
              ...value,
              classId,
              subjectId: '',
            })
          }}
          disabled={!value.academicPeriodId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a turma">
              {selectedClassName ?? 'Selecione a turma'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {classes.map((classItem) => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Materia *</Label>
        <Select
          value={value.subjectId}
          onValueChange={(subjectId, _event) => {
            if (!subjectId) return
            onChange({ ...value, subjectId })
          }}
          disabled={!value.classId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a materia">
              {selectedSubjectName ?? 'Selecione a materia'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={`${subject.id}:${subject.teacherId}`} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
