import { useQueryState } from 'nuqs'
import { useResponsavelStore } from '../stores/responsavel_store'

export function useSelectedStudent() {
  const [alunoSlug, setAlunoSlug] = useQueryState('aluno')
  const { students, isLoaded, getStudentBySlug } = useResponsavelStore()

  const selectedStudent = getStudentBySlug(alunoSlug)

  // Se não tem aluno na URL mas tem students, seta o primeiro
  const setDefaultStudent = () => {
    if (!alunoSlug && students.length > 0) {
      setAlunoSlug(students[0].slug, { shallow: true })
    }
  }

  return {
    student: selectedStudent,
    studentSlug: alunoSlug,
    setStudentSlug: setAlunoSlug,
    students,
    isLoaded,
    setDefaultStudent,
  }
}
