import type { HttpContext } from '@adonisjs/core/http'
import StudentHasResponsible from '#models/student_has_responsible'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'

export default class GetStudentAcademicPeriodsController {
  async handle({ params, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const { studentId } = params

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver os dados deste aluno')
    }

    const student = await relation.related('student').query().first()
    if (!student || !student.classId) {
      return { data: [] }
    }

    const classEntity = await Class_.query()
      .where('id', student.classId)
      .preload('academicPeriods', (q) => {
        q.orderBy('startDate', 'desc')
      })
      .first()

    if (!classEntity) {
      return { data: [] }
    }

    const periods = classEntity.academicPeriods.map((ap) => ({
      id: ap.id,
      name: ap.name,
      startDate: ap.startDate?.toISO() ?? null,
      endDate: ap.endDate?.toISO() ?? null,
    }))

    return { data: periods }
  }
}
