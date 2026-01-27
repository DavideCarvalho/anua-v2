import { useEffect } from 'react'
import { useQueryState } from 'nuqs'
import { Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import { useQuery } from '@tanstack/react-query'
import { useResponsavelStore, type Student } from '../../stores/responsavel_store'

// Componente que carrega os dados e popula o store
export function StudentSelectorWithData() {
  const { data, isLoading } = useQuery(useResponsavelStatsQueryOptions())
  const { setStudents, students, isLoaded } = useResponsavelStore()
  const [alunoSlug, setAlunoSlug] = useQueryState('aluno')

  // Popula o store quando os dados carregam
  useEffect(() => {
    if (data?.students && !isLoaded) {
      setStudents(data.students as Student[])
    }
  }, [data?.students, isLoaded, setStudents])

  // Define o aluno padrão na URL se não tiver
  useEffect(() => {
    if (isLoaded && students.length > 0 && !alunoSlug) {
      setAlunoSlug(students[0].slug, { shallow: true })
    }
  }, [isLoaded, students, alunoSlug, setAlunoSlug])

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
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <SelectValue placeholder="Selecione o aluno" />
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
