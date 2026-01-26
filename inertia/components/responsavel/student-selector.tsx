import { usePage, router } from '@inertiajs/react'
import { Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useResponsavelStatsQueryOptions } from '../../hooks/queries/use_responsavel_stats'
import { useQuery } from '@tanstack/react-query'

interface Student {
  id: string
  name: string
  className: string
  levelName?: string
}

interface StudentSelectorProps {
  students: Student[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  showInHeader?: boolean
}

export function StudentSelector({
  students,
  selectedId,
  onSelect,
  showInHeader = false,
}: StudentSelectorProps) {
  const { url } = usePage()
  
  // Safe URL parsing
  let urlStudentId: string | null = null
  try {
    const urlObj = typeof window !== 'undefined'
      ? new URL(url, window.location.origin)
      : new URL(`http://localhost${url}`)
    urlStudentId = urlObj.searchParams.get('aluno')
  } catch {
    // Fallback if URL parsing fails
    const match = url.match(/[?&]aluno=([^&]+)/)
    urlStudentId = match ? match[1] : null
  }
  
  const currentStudentId = selectedId || urlStudentId || students[0]?.id

  const handleStudentChange = (studentId: string) => {
    if (onSelect) {
      onSelect(studentId)
    } else {
      // Update URL with query param
      try {
        const newUrl = typeof window !== 'undefined'
          ? new URL(url, window.location.origin)
          : new URL(`http://localhost${url}`)
        newUrl.searchParams.set('aluno', studentId)
        router.visit(newUrl.pathname + newUrl.search, { preserveState: true })
      } catch {
        // Fallback: just append query param
        const separator = url.includes('?') ? '&' : '?'
        router.visit(`${url}${separator}aluno=${studentId}`, { preserveState: true })
      }
    }
  }

  const selectedStudent = students.find((s) => s.id === currentStudentId) || students[0]

  if (students.length === 0) {
    return null
  }

  if (students.length === 1) {
    // Se só tem um aluno, mostra apenas o nome
    return (
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{selectedStudent?.name}</span>
      </div>
    )
  }

  // Se tem múltiplos alunos, mostra o seletor
  if (showInHeader) {
    // Versão compacta para header
    return (
      <Select value={currentStudentId || ''} onValueChange={handleStudentChange}>
        <SelectTrigger className="w-[200px]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <SelectValue placeholder="Selecione o aluno" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span>{student.name}</span>
                  {student.className && (
                    <span className="text-xs text-muted-foreground">{student.className}</span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Versão completa para páginas
  return (
    <div className="flex flex-wrap gap-2">
      {students.map((student) => (
        <button
          key={student.id}
          onClick={() => handleStudentChange(student.id)}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            currentStudentId === student.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-background hover:bg-muted'
          }`}
        >
          <Users className="h-4 w-4" />
          {student.name}
          <span className="text-xs opacity-70">({student.className})</span>
        </button>
      ))}
    </div>
  )
}

// Hook para usar o seletor com dados do stats
export function StudentSelectorWithData() {
  const { data, isLoading } = useQuery(useResponsavelStatsQueryOptions())
  const { url } = usePage()
  
  if (isLoading || !data) {
    return <div className="h-9 w-[200px] animate-pulse rounded bg-muted" />
  }
  
  // Safe URL parsing
  let currentStudentId: string | null = null
  try {
    const urlObj = typeof window !== 'undefined' 
      ? new URL(url, window.location.origin)
      : new URL(`http://localhost${url}`)
    currentStudentId = urlObj.searchParams.get('aluno')
  } catch {
    // Fallback if URL parsing fails
    const match = url.match(/[?&]aluno=([^&]+)/)
    currentStudentId = match ? match[1] : null
  }

  return (
    <StudentSelector
      students={data.students.map((s) => ({
        id: s.id,
        name: s.name,
        className: s.className,
        levelName: s.levelName,
      }))}
      selectedId={currentStudentId}
      showInHeader={true}
    />
  )
}
