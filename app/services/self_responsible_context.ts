import type User from '#models/user'
import Student from '#models/student'
import StudentHasLevel from '#models/student_has_level'
import type { AcademicPeriodSegment } from '#models/academic_period'

export interface SelfResponsibleContext {
  isSelfResponsible: boolean
  segment: AcademicPeriodSegment | null
  studentId: string | null
}

const EMPTY: SelfResponsibleContext = {
  isSelfResponsible: false,
  segment: null,
  studentId: null,
}

/**
 * Deriva o contexto de aluno autorresponsável a partir do usuário.
 * Requer `user.role` carregado. Retorna vazio pra não-alunos.
 */
export async function resolveSelfResponsibleContext(user: User): Promise<SelfResponsibleContext> {
  if (user.role?.name !== 'STUDENT') return EMPTY

  const student = await Student.find(user.id)
  if (!student) return EMPTY

  const level = await StudentHasLevel.query()
    .where('studentId', student.id)
    .whereNull('deletedAt')
    .orderBy('createdAt', 'desc')
    .preload('academicPeriod')
    .first()

  return {
    isSelfResponsible: student.isSelfResponsible,
    segment: level?.academicPeriod?.segment ?? null,
    studentId: student.id,
  }
}
