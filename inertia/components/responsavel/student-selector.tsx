import { useEffect } from 'react'
import { useQueryState } from 'nuqs'
import { Users } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { api } from '~/lib/api'
import { useQuery } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'
import { useResponsavelStore, type Student } from '../../stores/responsavel_store'

type ResponsavelStatsResponse = Route.Response<'api.v1.dashboard.responsavel_stats'>
type ResponsavelStudent = ResponsavelStatsResponse['students'][number]

function parseAlunoFromWindowSearch(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('aluno')
}

function toStoreStudent(student: ResponsavelStudent): Student {
  return {
    id: student.id,
    slug: student.slug,
    name: student.name,
    className: student.className,
    levelName: student.levelName,
    averageGrade: student.averageGrade,
    attendanceRate: student.attendanceRate,
    pendingPayments: student.pendingPayments,
    points: student.points,
    permissions: student.permissions,
  }
}

// Componente que carrega os dados e popula o store
export function StudentSelectorWithData() {
  const { data, isLoading } = useQuery(api.api.v1.dashboard.responsavelStats.queryOptions({}))
  const { setStudents, students, isLoaded, setSelectedStudentId } = useResponsavelStore()
  const [alunoSlug, setAlunoSlug] = useQueryState('aluno')

  // Popula o store quando os dados carregam
  useEffect(() => {
    if (data?.students && !isLoaded) {
      setStudents(data.students.map(toStoreStudent))
    }
  }, [data?.students, isLoaded, setStudents])

  // Define o aluno padrão na URL se não tiver
  useEffect(() => {
    if (isLoaded && students.length > 0 && !alunoSlug) {
      setAlunoSlug(students[0].slug, { shallow: true })
    }
  }, [isLoaded, students, alunoSlug, setAlunoSlug])

  // Mantém selectedStudentId na store alinhado ao ?aluno= (mesma regra do select / fallback)
  useEffect(() => {
    if (!isLoaded || students.length === 0) return
    const alunoKey = alunoSlug ?? parseAlunoFromWindowSearch()
    const selected = alunoKey
      ? (students.find((s) => s.slug === alunoKey) ?? students[0])
      : students[0]
    if (selected) {
      setSelectedStudentId(selected.id)
    }
  }, [isLoaded, students, alunoSlug, setSelectedStudentId])

  if (isLoading || !isLoaded) {
    return <div className="h-9 w-[200px] animate-pulse rounded bg-muted" />
  }

  if (students.length === 0) {
    return null
  }

  const selectedStudent = students.find((s) => s.slug === alunoSlug) || students[0]

  if (students.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{selectedStudent?.name}</span>
      </div>
    )
  }

  return (
    <Select value={alunoSlug || ''} onValueChange={(slug) => setAlunoSlug(slug)}>
      <SelectTrigger className="w-[200px]">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
          <Users className="h-4 w-4 shrink-0" />
          <span className="truncate text-left">{selectedStudent?.name || 'Selecione o aluno'}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.slug}>
            <div className="flex flex-col">
              <span>{student.name}</span>
              <span className="text-xs text-muted-foreground">{student.className}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
