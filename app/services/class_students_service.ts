/**
 * Class Students Service
 *
 * Busca alunos de uma turma validando o contexto curso+período letivo.
 * Suporta múltiplas turmas por aluno (casos de DP em ensino técnico/superior).
 */

import StudentHasLevel from '#models/student_has_level'
import type Student from '#models/student'

export interface ClassContextParams {
  classId: string
  courseId: string
  academicPeriodId: string
}

export interface StudentInClass {
  studentId: string
  studentHasLevelId: string
  student: Student
}

interface PaginationParams {
  page: number
  limit: number
}

interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

/**
 * Busca alunos de uma turma no contexto curso+período letivo.
 * Valida que o StudentHasLevel está vinculado a um LevelAssignedToCourseHasAcademicPeriod
 * ativo e pertencente ao curso e período corretos.
 */
export async function getStudents(params: ClassContextParams): Promise<StudentInClass[]> {
  const { classId, courseId, academicPeriodId } = params

  const studentLevels = await StudentHasLevel.query()
    .where('classId', classId)
    .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
      laQuery
        .where('isActive', true)
        .whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
    })
    .preload('student', (sq) => sq.preload('user'))
    .orderBy('createdAt', 'asc')

  return studentLevels.map((sl) => ({
    studentId: sl.studentId,
    studentHasLevelId: sl.id,
    student: sl.student,
  }))
}

/**
 * Versão paginada de getStudents
 */
export async function getStudentsPaginated(
  params: ClassContextParams,
  pagination: PaginationParams
): Promise<PaginatedResult<StudentInClass>> {
  const { classId, courseId, academicPeriodId } = params
  const { page, limit } = pagination

  const studentLevels = await StudentHasLevel.query()
    .where('classId', classId)
    .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
      laQuery
        .where('isActive', true)
        .whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
    })
    .preload('student', (sq) => sq.preload('user'))
    .orderBy('createdAt', 'asc')
    .paginate(page, limit)

  const data = studentLevels.all().map((sl) => ({
    studentId: sl.studentId,
    studentHasLevelId: sl.id,
    student: sl.student,
  }))

  return {
    data,
    meta: {
      total: studentLevels.total,
      perPage: studentLevels.perPage,
      currentPage: studentLevels.currentPage,
      lastPage: studentLevels.lastPage,
    },
  }
}

/**
 * Retorna apenas os IDs dos alunos (útil para queries de attendance, grades, etc)
 */
export async function getStudentIds(params: ClassContextParams): Promise<string[]> {
  const { classId, courseId, academicPeriodId } = params

  const studentLevels = await StudentHasLevel.query()
    .where('classId', classId)
    .whereHas('levelAssignedToCourseAcademicPeriod', (laQuery) => {
      laQuery
        .where('isActive', true)
        .whereHas('courseHasAcademicPeriod', (caQuery) => {
          caQuery.where('courseId', courseId).where('academicPeriodId', academicPeriodId)
        })
    })
    .select('studentId')

  return studentLevels.map((sl) => sl.studentId)
}
